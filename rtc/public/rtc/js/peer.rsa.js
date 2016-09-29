var PeerRSA = PeerRSA || {};
PeerRSA.duplex = false;
PeerRSA.uri = PeerRSA.uri || {};
PeerRSA.uri.a = PeerRSA.uri.a || 'wss://' + location.host + '/rtc/wss/a';
PeerRSA.uri.b = PeerRSA.uri.b || 'wss://' + location.host + '/rtc/wss/b';

navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var URL = window.URL || window.webkitURL;
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;


/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = function () {
  this.wss = PeerRSA.A.wss || new WebSocket(PeerRSA.uri.a,'wator.rtc.a');
  var self = this;
  this.wss.onopen = function (event) {
    self.signalOpened(event);
  }
  this.wss.onclose = function (event) {
    self.signalClosed(event);
  }
  this.wss.onerror = function (err) {
    console.error(err);
  }
  this.wss.onmessage = function (event) {
    self.onSignalMsg_(event).bind(this);
  }
}

PeerRSA.A.prototype.signalOpened = function (event) {
  console.log(event);
}
PeerRSA.A.prototype.signalClosed = function (event) {
  console.log(event);
}
PeerRSA.A.prototype.createKey = function () {
  //console.log(KEYUTIL.version);
  var rsaKeypair = KEYUTIL.generateKeypair("RSA", 4096);
  //console.log(rsaKeypair);
  var priKey =rsaKeypair.prvKeyObj;
  var priKeyStr = KEYUTIL.getPEM(priKey,"PKCS8PRV");
  //console.log(priKeyStr);
  localStorage.setItem('rtc.PeerRSA.A.privateKey',priKeyStr);
  var pubKey =rsaKeypair.pubKeyObj;
  //console.log(pubKey);
  var pubKeyStr = KEYUTIL.getPEM(pubKey);
  localStorage.setItem('rtc.PeerRSA.A.publicKey',pubKeyStr);
  var token = KJUR.crypto.Util.sha1(pubKeyStr);
  //console.log(token);
  localStorage.setItem('rtc.PeerRSA.A.token',token);
}
PeerRSA.A.prototype.readKeyStr = function () {
  return localStorage.getItem('rtc.PeerRSA.A.publicKey');
}



/*
 config : {A:{video:{},audio:{}},B:{video:{},audio:{}}}
*/
PeerRSA.A.prototype.connect = function (config) {
  console.log(this);
  var msg = {cmd:'start',body:config};
  this.sendSignal_(msg).bind(this);
  if(config.A) {
    navigator.getUserMedia(config.A,this.gotMediaSuccess,this.gotMediaFailure);
  }
}
PeerRSA.A.prototype.gotMediaSuccess = function (stream) {
  console.log(this);
}
/*
  PeerRSA.B is Peer import RSA key.
*/
PeerRSA.B = function () {
  this.wss = this.wss || new WebSocket(PeerRSA.uri.b,'wator.rtc.b');
  var self = this;
  this.wss.onopen = function (event) {
    self.signalOpened(event);
  }
  this.wss.onclose = function (event) {
    self.signalClosed(event);
  }
  this.wss.onerror = function (err) {
    console.error(err);
  }
  this.wss.onmessage = function (event) {
    self.onSignalMsg_(event).bind(this);
  }
}

PeerRSA.B.prototype.signalOpened = function (event) {
  console.log(event);
}
PeerRSA.B.prototype.signalClosed = function (event) {
  console.log(event);
}

PeerRSA.B.prototype.importKey = function (newPubKey) {
  //
  try {
    var pubKeysStr = localStorage.getItem('rtc.PeerRSA.B.publicKey');
    var pubKeys = JSON.parse(pubKeysStr);
    var token = KJUR.crypto.Util.sha1(newPubKey);
    pubKeys[token] = newPubKey;
    localStorage.setItem('rtc.PeerRSA.B.publicKey',JSON.stringify(pubKeys));
  } catch(e) {
    console.error(e);
  }
}









/*
 inner functions.
*/
PeerRSA.A.prototype.onSignalMsg_ = function (event) {
  console.log(event);
  console.log(this);
  var dataJson = JSON.parse(event.data);
  var good = true
  if(PeerRSA.duplex) {
    good = PeerRSA.verify_(dataJson[token],dataJson[orig],dataJson[sign]);
  }
  if(good) {
    PeerRSA.onSignalRTC_(dataJson[rtc]).bind(this);
  }
}
PeerRSA.A.prototype.sendSignal_ = function (msg) {
  console.log(event);
  console.log(this);
  this.token = this.token || localStorage.getItem('rtc.PeerRSA.A.token');
  var date = new Date();
  this.orig = this.orig || date.toUTCString();
  this.signature = this.signature || PeerRSA.signature_(orig);
  var wsMsg = {
    token:this.token,
    orig:this.orig,
    sign:this.signature,
    rtc:msg
  };
  this.wss.send(JSON.stringify(wsMsg));
}

PeerRSA.B.prototype.onSignalMsg_ = function (event) {
  console.log(event);
  console.log(this);
  var dataJson = JSON.parse(event.data);
  var good = PeerRSA.verify_(dataJson[token],dataJson[orig],dataJson[sign]);
  if(good) {
    PeerRSA.onSignalRTC_(dataJson[rtc]).bind(this);
  }
}
PeerRSA.B.prototype.sendSignal_ = function (msg,token) {
  console.log(event);
  console.log(this);
  if(PeerRSA.duplex) {
    var wsMsg = {
      token:token,
      rtc:msg
    };
    this.wss.send(JSON.stringify(wsMsg));
  } else {
    var wsMsg = {
      token:token,
      rtc:msg
    };
    this.wss.send(JSON.stringify(wsMsg));
  }
}


PeerRSA.signature_ = function(orig) {
  try {
    var privateKey = localStorage.getItem('rtc.PeerRSA.A.privateKey');
    var rsaKey = KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(privateKey);
    var signature = rsaKey.signString(orig,"sha256");
    return signature;
  } catch(e) {
    console.error(e);
    return nul;
  }
}
PeerRSA.verify_ = function(token,orig,signature) {
  try {
    var pubKeysStr = localStorage.getItem('rtc.PeerRSA.B.publicKey');
    var pubKeys = JSON.parse(pubKeysStr);
    var rsaKey = KEYUTIL.getKey(pubKeys[token]);
    var result = rsaKey.verifyString(orig,signature);
    if(result == 0) {
      return true;
    } else {
      return false;
    }
  } catch(e) {
    console.error(e);
    return false;
  }
}

PeerRSA.onSignalRTC_ = function(msg) {
  console.log(this);
}
