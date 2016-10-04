var PeerRSA = PeerRSA || {};
PeerRSA.uri = PeerRSA.uri || {};
PeerRSA.uri.a = PeerRSA.uri.a || 'wss://' + location.host + '/rtc/wss/a';
PeerRSA.uri.b = PeerRSA.uri.b || 'wss://' + location.host + '/rtc/wss/b';

navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var URL = window.URL || window.webkitURL;
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;

PeerRSA.Key = PeerRSA.Key ||{};
PeerRSA.Key.A = PeerRSA.Key.A || {};

PeerRSA.Key.A.createKey = function (cb) {
  console.log(cb);
  PeerRSA.createKeyPair_(cb);
}
PeerRSA.Key.A.readKeyStr = function () {
  return localStorage.getItem('rtc.PeerRSA.A.key.public');
}

PeerRSA.Key.A.onLoadCheckSuccess = function() {
  
}

PeerRSA.Key.B = PeerRSA.Key.B || {};

PeerRSA.Key.B.addKey = function (rawPubKey) {
  //
  try {
    //console.log(rawPubKey);
    var pubKey = rawPubKey.replace(/(?:\n)+/g, '\r\n') + '\r\n';
    var aKeyStr = PeerRSA.Key.A.readKeyStr();
    //console.log(pubKey);
    //console.log(pubKey.length);
    //console.log(aKeyStr);
    //console.log(aKeyStr.length);
    //console.log(aKeyStr + pubKey);
    //console.log(pubKey + aKeyStr);
    // token@a throw signal sha(A.pub + B.pub)
    var token_a = KJUR.crypto.Util.sha256(aKeyStr + pubKey);
    //console.log(token_a);

    var aOldTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.token'));
    //console.log(aOldTokens);
    aOldTokens = aOldTokens || {};
    //console.log(aOldTokens);
    aOldTokens['t_' + token_a] = pubKey;
    localStorage.setItem('rtc.PeerRSA.A.token',JSON.stringify(aOldTokens));

    // token@b wait signal sha(B.pub + A.pub)
    var token_b = KJUR.crypto.Util.sha256(pubKey + aKeyStr);
    //console.log(token_b);

    var bOldTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.token'));
    //console.log(bOldTokens);
    bOldTokens = bOldTokens || {};
    //console.log(bOldTokens);
    bOldTokens['t_' + token_b] = pubKey;
    localStorage.setItem('rtc.PeerRSA.B.token',JSON.stringify(bOldTokens));
  } catch(e) {
  console.error(e);
  }
}

PeerRSA.Key.B.getRemoteDevices = function (cb) {
  //
  try {
    var bTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.token'));
    //console.log(bTokens);
    bTokens = bTokens || {};
    if (typeof cb == 'function') {
      cb(bTokens);
    }
    //console.log(bTokens);
    return bTokens;
  } catch(e) {
    console.error(e);
    return {};
  }
}




/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = function (token) {
  this.wss = PeerRSA.A.wss || new WebSocket(PeerRSA.uri.a,'wator.rtc.a');
  var self = this;
  this.wss.onopen = function (event) {
    setTimeout(self.onOpenInternal_.bind(self),1);
    self.signalOpened(event);
  }
  this.wss.onclose = function (event) {
    self.signalClosed(event);
  }
  this.wss.onerror = function (err) {
    console.error(err);
  }
  this.wss.onmessage = function (event) {
    self.onSignalMsg_(event);
  }
  var tokenSaved = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.token'));
  //console.log(tokenSaved);
  if(tokenSaved == null ) {
    return;
  }
  if(token) {
    var indexToken = 't_' + token;
    if(tokenSaved[indexToken]) {
      this.token = indexToken;
    }
  } else {
    var tokensIndex = Object.keys(tokenSaved);
    //console.log(tokensIndex);
    if (tokensIndex.length > 0) {
      this.token = tokensIndex[0];
    }
  }
  console.log(this.token);
}

PeerRSA.A.prototype.signalOpened = function (event) {
  console.log(event);
}
PeerRSA.A.prototype.signalClosed = function (event) {
  console.log(event);
}

/*
inner function.
*/
PeerRSA.A.prototype.onOpenInternal_ = function () {
  console.log(this.token);
  var remote = PeerRSA.Key.B.getRemoteDevices();
  var msg = {signal:{wait:Object.keys(remote)}};
  this.wss.send(JSON.stringify(msg));
}



/*
 config : {A:{video:{},audio:{}},B:{video:{},audio:{}}}
*/
PeerRSA.A.prototype.connect = function (config) {
  console.log(this);
  var msg = {cmd:'start',config:config};
  this.sendSignal_(msg);
  if(config.A) {
    navigator.getUserMedia(config.A,this.gotMediaSuccess,this.gotMediaFailure);
  }
}
PeerRSA.A.prototype.gotMediaSuccess = function (stream) {
  console.log(this);
}
PeerRSA.A.prototype.gotMediaFailure = function (e) {
  console.error(e);
}
/*
  PeerRSA.B is Peer import RSA key.
*/
PeerRSA.B = function (token) {
  this.wss = this.wss || new WebSocket(PeerRSA.uri.b,'wator.rtc.b');
  var self = this;
  this.wss.onopen = function (event) {
    setTimeout(self.onOpenInternal_.bind(self),1);
    self.signalOpened(event);
  }
  this.wss.onclose = function (event) {
    self.signalClosed(event);
  }
  this.wss.onerror = function (err) {
    console.error(err);
  }
  this.wss.onmessage = function (event) {
    self.onSignalMsg_(event);
  }
}

PeerRSA.B.prototype.signalOpened = function (event) {
  console.log(event);
}
PeerRSA.B.prototype.signalClosed = function (event) {
  console.log(event);
}

PeerRSA.B.prototype.wait = function () {
}


/*
 inner function.
 */
PeerRSA.B.prototype.onOpenInternal_ = function () {
  var remote = PeerRSA.Key.B.getRemoteDevices();
  var msg = {signal:{wait:Object.keys(remote)}};
  this.wss.send(JSON.stringify(msg));
}



/*
 inner functions.
*/
PeerRSA.A.prototype.onSignalMsg_ = function (event) {
  console.log(event);
  console.log(this);
  var dataJson = JSON.parse(event.data);
  var good = PeerRSA.verify_(dataJson.orig,dataJson.sign);
  if(good) {
    this.onSignalRTC_(dataJson.rtc);
  }
}
PeerRSA.A.prototype.sendSignal_ = function (msg) {
  console.log(this);
  var date = new Date();
  this.orig = this.orig || date.toUTCString();
  this.signature = this.signature || PeerRSA.signature_(this.orig);
  var wsMsg = {
    token:this.token,
    orig:this.orig,
    sign:this.signature,
    rtc:msg
  };
  this.wss.send(JSON.stringify(wsMsg));
}
PeerRSA.A.prototype.onSignalRTC_ = function(rtc) {
  console.log(this);
  console.log(rtc);
}

PeerRSA.B.prototype.onSignalMsg_ = function (event) {
  //console.log(event);
  //console.log(this);
  var dataJson = JSON.parse(event.data);
  console.log(dataJson);
  var good = PeerRSA.verify_(dataJson.orig,dataJson.sign);
  console.log(good);
  if(good) {
    this.onSignalRTC_(dataJson.rtc);
  }
}
PeerRSA.B.prototype.sendSignal_ = function (msg,token) {
  console.log(this);
  var date = new Date();
  this.orig = this.orig || date.toUTCString();
  this.signature = this.signature || PeerRSA.signature_(this.orig);
  var wsMsg = {
    token:token,
    orig:this.orig,
    sign:this.signature,
    rtc:msg
  };
  this.wss.send(JSON.stringify(wsMsg));
}

PeerRSA.B.prototype.onSignalRTC_ = function(rtc) {
  console.log(this);
  console.log(rtc);
  if(rtc.cmd == 'start') {
    //console.log(rtc.body.B);
    //this.A.pc2 = new RTCPeerConnection();
    if(rtc.config.B) {
      navigator.getUserMedia(rtc.config.B,this.gotMediaSuccess,this.gotMediaFailure);
      this.B = this.B || {};
      var servers = null;
      this.B.pc = new RTCPeerConnection(servers);
    }
  }
}


PeerRSA.signature_ = function(orig) {
  try {
    var privateKey = localStorage.getItem('rtc.PeerRSA.A.key.private');
    var rsaKey = KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(privateKey);
    var signature = rsaKey.signString(orig,"sha256");
    return signature;
  } catch(e) {
    console.error(e);
    return nul;
  }
}
PeerRSA.verify_ = function(orig,signature) {
  try {
    var pubKeysStr = localStorage.getItem('rtc.PeerRSA.B.token');
    var pubKeys = JSON.parse(pubKeysStr);
    var tokens =  Object.keys(pubKeys);
    for(var i = 0 ; i < tokens.length;i++) {
      var token = tokens[i];
      var rsaKey = KEYUTIL.getKey(pubKeys[token]);
      var result = rsaKey.verifyString(orig,signature);
      console.log(result);
      if(result) {
        return true;
      }
    }
    return false;
  } catch(e) {
    console.error(e);
    return false;
  }
}




PeerRSA.createKeyPair_ = function(cb) {
  console.log(cb);
  window.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096, //can be 1024, 2048, or 4096
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["sign", "verify"] //can be any combination of "sign" and "verify"
  )
  .then(function(key){
    //returns a keypair object
    console.log(key);
    console.log(key.publicKey);
    console.log(key.privateKey);
    window.crypto.subtle.exportKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    key.publicKey //can be a publicKey or privateKey, as long as extractable was true
    )
    .then(function(keydata){
      //returns the exported key data
      console.log(keydata);
      var keyObj = KEYUTIL.getKey(keydata);
      console.log(keyObj);
      var pem = KEYUTIL.getPEM(keyObj);
      console.log(pem);
      localStorage.setItem('rtc.PeerRSA.A.key.public',pem);
      console.log( typeof cb);
      if (typeof cb == 'function') {
        cb('success');
      }
    })
    .catch(function(err){
    console.error(err);
    });
    window.crypto.subtle.exportKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    key.privateKey //can be a publicKey or privateKey, as long as extractable was true
    )
    .then(function(keydata){
        //returns the exported key data
      console.log(keydata);
      var keyObj = KEYUTIL.getKey(keydata);
      console.log(keyObj);
      var pem = KEYUTIL.getPEM(keyObj,"PKCS8PRV");
      console.log(pem);
      localStorage.setItem('rtc.PeerRSA.A.key.private',pem);
    })
    .catch(function(err){
      console.error(err);
    });
  })
  .catch(function(err){
    console.error(err);
  });
}

/*
 run only one time.
*/
PeerRSA.Key.A.createKey_flag = true;
PeerRSA.Key.A.checkKeyOnload_ = function () {
  var priKey = localStorage.getItem('rtc.PeerRSA.A.key.private');
  var pubKey = localStorage.getItem('rtc.PeerRSA.A.key.public');
  if( typeof priKey === 'string' && typeof pubKey === 'string') {
    //console.log('Key is saved already');
    return 
  }
  if(PeerRSA.Key.A.createKey_flag) {
    PeerRSA.createKeyPair_(PeerRSA.Key.A.onLoadCheckSuccess);
  }
  PeerRSA.Key.A.createKey_flag = false;
}
PeerRSA.Key.A.checkKeyOnload_();
