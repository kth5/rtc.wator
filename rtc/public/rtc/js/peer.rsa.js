var PeerRSA = PeerRSA || {};
PeerRSA.uri = PeerRSA.uri || 'wss://' + location.host + '/rtc/wss';
/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = function () {
  this.wss = PeerRSA.A.wss || new WebSocket(PeerRSA.uri,'wator.rtc.a');
  this.wss.onopen = function (event) {
    this.signalOpened(event);
  }
  this.wss.onclose = function (event) {
    this.signalClosed(event);
  }
  this.wss.onerror = function (err) {
    console.error(err);
  }
  this.wss.onmessage = function (event) {
    this.onMsg_(event).bind(this);
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


/*
 config : {A:{video:{},audio:{}},B:{video:{},audio:{}}}
*/
PeerRSA.A.prototype.connect = function (config) {
  console.log(this);
  var msg = {cmd:'start',body:config};
  this->sendSignal_(msg).bind(this);
}

/*
  PeerRSA.B is Peer import RSA key.
*/
PeerRSA.B = function () {
  this.wss = this.wss || new WebSocket(PeerRSA.uri,'wator.rtc.b');
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

