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

PeerRSA.Key = PeerRSA.Key ||{};
PeerRSA.Key.A = PeerRSA.Key.A || {};

PeerRSA.Key.A.createKey = function (cb) {
	console.log(cb);
	PeerRSA.createKeyPair_(cb);
}
PeerRSA.Key.A.readKeyStr = function () {
  return localStorage.getItem('rtc.PeerRSA.A.key.public');
}

PeerRSA.Key.B = PeerRSA.Key.B || {};

PeerRSA.Key.B.importKey = function (newPubKey) {
  //
  try {
    var pubKeysStr = localStorage.getItem('rtc.PeerRSA.B.key');
    var pubKeyStrA = PeerRSA.Key.A.readKeyStr();
    var pubKeys = JSON.parse(pubKeysStr);
    // token @watch sha(B.pub + A.pub)
    var token = KJUR.crypto.Util.sha256(newPubKey + pubKeyStrA);
    pubKeys[token] = newPubKey;
    localStorage.setItem('rtc.PeerRSA.B.publicKey',JSON.stringify(pubKeys));
  } catch(e) {
    console.error(e);
  }
}





/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = function (token) {
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
  var tokenSave = JSON.parse(localStorage.getItem('rtc.PeerRSA.tokens'));
  if(tokenSave == null ) {
	  return;
  }
  if(tokenSave['AB'] == null ) {
	  console.error('Can not find a contact of ' + token + '');
	  return;
  }
  console.log(tokenSave);
  if(token && tokenSave && tokenSave['AB']) {
	for (var i=0;i<tokenSave['AB'].length;i++) {
		if(token === tokenSave['AB'][i]) {
			this.token = token;
		}
	}
  } else {
	if (tokenSave['AB'].length > 0) {
		this.token = tokenSave['AB'][0];
	}
  }
}

PeerRSA.A.prototype.signalOpened = function (event) {
  console.log(event);
}
PeerRSA.A.prototype.signalClosed = function (event) {
  console.log(event);
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
    var privateKey = localStorage.getItem('rtc.PeerRSA.A.key.private');
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
    var pubKeysStr = localStorage.getItem('rtc.PeerRSA.B.key.public');
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
    PeerRSA.createKeyPair_();
  }
  PeerRSA.Key.A.createKey_flag = false;
}
PeerRSA.Key.A.checkKeyOnload_();
