
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var URL = window.URL || window.webkitURL;
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;


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
      this.dst = indexToken;
    }
  } else {
    var tokensIndex = Object.keys(tokenSaved);
    //console.log(tokensIndex);
    if (tokensIndex.length > 0) {
      this.dst = tokensIndex[0];
    }
  }
  if (PeerRSA.debug) {
    console.log(this.dst);
  }
  var aPairs = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.pair'));
  if (aPairs) {
    this.src = aPairs[this.dst];
  }
}

PeerRSA.A.prototype.signalOpened = function (evt) {
  if (PeerRSA.debug) {
    console.log(evt);
  }
}
PeerRSA.A.prototype.signalClosed = function (evt) {
  if (PeerRSA.debug) {
    console.log(evt);
  }
}
PeerRSA.A.prototype.onaddstream = function (src) {
  if (PeerRSA.debug) {
    console.log(src);
  }
}






/*
 PeerRSA.A.connect config {A:{video:{},audio:{}},B:{video:{},audio:{}}}
*/
PeerRSA.A.prototype.connect = function (config) {
  var msg = {cmd:'start',config:config};
  this.sendSignal_(msg);
  if(config.A) {
    this.cast_ = this.cast_ || {};
    console.log(PeerRSA.config);
    console.log(PeerRSA.pcOptions);
    this.cast_.pc = new RTCPeerConnection(PeerRSA.config,PeerRSA.pcOptions);
    navigator.getUserMedia(config.A,this.gotMediaSuccess_.bind(this),this.gotMediaFailure_.bind(this));
  }
  if(config.B) {  
    this.catch_ = this.catch_ || {};
    console.log(PeerRSA.config);
    console.log(PeerRSA.pcOptions);
    this.catch_.pc = new RTCPeerConnection(PeerRSA.config,PeerRSA.pcOptions);
    this.catch_.pc.onicecandidate = function(evt){
      if(evt.candidate) {
        console.log(evt.candidate);
        var rtc = {cmd:"catch.a.ice",candidate:evt.candidate};
        if (PeerRSA.debug) {
          console.log(JSON.stringify(rtc));
        }
        this.sendSignal_(rtc);
      } else {
        console.log("end of onicecandidate");
      }
    }.bind(this);
    this.catch_.pc.onaddstream = function (evt) {
      if (PeerRSA.debug) {
        console.log(evt);
      }
      var src = URL.createObjectURL(evt.stream);
      this.onaddstream(src);
    }.bind(this);
  }
}
PeerRSA.A.prototype.onMediaType_ = function (config) {
  if(config) {  
    this.mediaConst = { mandatory: { OfferToReceiveAudio: false, OfferToReceiveVideo: false } };
    if(config.video) {
      this.mediaConst.mandatory.OfferToReceiveVideo = true;
    }
    if(config.audio) {
      this.mediaConst.mandatory.OfferToReceiveAudio = true;
    }
  }
}


PeerRSA.A.prototype.gotMediaSuccess_ = function (stream) {
  if (PeerRSA.debug) {
    console.log(stream);
  }
  this.cast_.pc.addStream(stream);
  this.cast_.pc.createOffer(this.offerSuccess_.bind(this),this.offerFailure_.bind(this));
}

PeerRSA.A.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
}

PeerRSA.A.prototype.offerSuccess_ = function (offer) {
  this.cast_.pc.setLocalDescription(offer,
    function () {
      console.log('setLocalDescription success')
    }.bind(this),
    function (e) {
      console.error(e);
  });
  var rtc = {cmd:"offer",offer:offer};
  this.sendSignal_(rtc);
}

PeerRSA.A.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
}

/*
inner function.
*/
PeerRSA.A.prototype.onOpenInternal_ = function () {
  var remote = PeerRSA.Key.B.getRemoteDevices();
  var msg = {signal:{wait:Object.keys(remote)}};
  this.wss.send(JSON.stringify(msg));
}

/*
 inner functions.
*/
PeerRSA.A.prototype.onSignalMsg_ = function (event) {
  if (PeerRSA.debug) {
    console.log(event);
  }
  var dataJson = JSON.parse(event.data);
  var good = PeerRSA.verify_(dataJson.orig,dataJson.sign);
  if(good) {
    if (PeerRSA.debug) {
      console.log(dataJson.dst);
    }
    if (dataJson.src) {
      this.dst = dataJson.src;
    }
    if (dataJson.dst) {
      this.src = dataJson.dst;
    }
    this.onRTCSignal_(dataJson.rtc);
  } else {
    console.warn('!!!attach!!!')
  }
}
PeerRSA.A.prototype.sendSignal_ = function (msg) {
  var date = new Date();
  this.orig = this.orig || date.toUTCString();
  this.signature = this.signature || PeerRSA.signature_(this.orig);
  var wsMsg = {
    dst:this.dst,
    src:this.src,
    orig:this.orig,
    sign:this.signature,
    rtc:msg
  };
  this.wss.send(JSON.stringify(wsMsg));
}
PeerRSA.A.prototype.onRTCSignal_ = function(rtc) {
  //console.log(this);
  //console.log(rtc);
  if(rtc.cmd == 'mediaType') {
    this.onMediaType_(rtc.config);
  }
  if(rtc.cmd == 'offer') {
    console.log(rtc.offer);
    var sdp = new RTCSessionDescription(rtc.offer); 
    this.catch_.pc.setRemoteDescription(sdp,this.onSetRemoteDescriptionSuccess_.bind(this));
  }
  if(rtc.cmd == 'cast.b.ice') {
    console.log(rtc.candidate);
    var rtcICE = new RTCIceCandidate(rtc.candidate);
    this.catch_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
  }
}
PeerRSA.A.prototype.onAddIceCandidateSuccess_ = function() {
  console.log('onAddIceCandidateSuccess_ success');
}
PeerRSA.A.prototype.onAddIceCandidateFailure_ = function(e) {
  console.error('onAddIceCandidateSuccess_',e);
}

PeerRSA.A.prototype.onSetRemoteDescriptionSuccess_ = function() {
  console.log('onSetRemoteDescriptionSuccess_');
  console.log(this.mediaConst);
  this.catch_.pc.createAnswer(this.onCreateAnswerSuccess_.bind(this),this.onCreateAnswerError_.bind(this),this.mediaConst); 
}
PeerRSA.A.prototype.onCreateAnswerSuccess_ = function(answer) {
  this.catch_.pc.setLocalDescription(answer,function(){
    console.log('setLocalDescription success');
  });
  var rtc = {cmd:"answer",answer:answer};
  this.sendSignal_(rtc);
}
PeerRSA.A.prototype.onCreateAnswerError_ = function(error) {
  console.error(error);
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
  if (PeerRSA.debug) {
    console.log(event);
  }
}
PeerRSA.B.prototype.signalClosed = function (event) {
  if (PeerRSA.debug) {
    console.log(event);
  }
}
/*
 PeerRSA.B.standby media {video:{},audio:{}}
*/
PeerRSA.B.prototype.standby = function (media) {
  this.allow = {};
  if(media) {
    this.allow.media = media;
    navigator.getUserMedia(media,this.success_,this.error_);
  }
}

PeerRSA.B.prototype.success_ = function (e) {
}
PeerRSA.B.prototype.error_ = function (e) {
}


/*
 inner function.
 */
PeerRSA.B.prototype.onOpenInternal_ = function () {
  var remote = PeerRSA.Key.B.getRemoteDevices();
  var msg = {signal:{wait:Object.keys(remote)}};
  this.wss.send(JSON.stringify(msg));
}





PeerRSA.B.prototype.onSignalMsg_ = function (event) {
  //console.log(event);
  //console.log(this);
  var dataJson = JSON.parse(event.data);
  if (PeerRSA.debug) {
    console.log(dataJson);
  }
  var good = PeerRSA.verify_(dataJson.orig,dataJson.sign);
  if (PeerRSA.debug) {
    console.log(good);
  }
  if(good) {
    if (PeerRSA.debug) {
      console.log(dataJson.dst);
    }
    if (dataJson.src) {
      this.dst = dataJson.src;
    }
    if (dataJson.dst) {
      this.src = dataJson.dst;
    }
    this.onRTCSignal_(dataJson.rtc);
  } else {
    console.warn('!!!attach!!!');
  }
}
PeerRSA.B.prototype.sendSignal_ = function (msg) {
  var date = new Date();
  this.orig = this.orig || date.toUTCString();
  this.signature = this.signature || PeerRSA.signature_(this.orig);
  var wsMsg = {
    dst:this.dst,
    src:this.src,
    orig:this.orig,
    sign:this.signature,
    rtc:msg
  };
  this.wss.send(JSON.stringify(wsMsg));
}

PeerRSA.B.prototype.onRTCSignal_ = function(rtc) {
  if (PeerRSA.debug) {
    console.log(rtc);
  }
  if(rtc.cmd == 'start') {
    if(rtc.config.A) {
      this.catch_ = this.catch_ || {};
      console.log(PeerRSA.config);
      console.log(PeerRSA.pcOptions);
      this.catch_.pc = new RTCPeerConnection(PeerRSA.config,PeerRSA.pcOptions);
    }
    if(rtc.config.B) {
      var media = rtc.config.B;
      if(rtc.config.B.video) {
        media.video = this.allow.media.video;
      }
      if(rtc.config.B.audio) {
        media.audio = this.allow.media.audio;
      }
      var rtc = {cmd:"mediaType",config:media};
      this.sendSignal_(rtc);
      
      this.cast_.pc = new RTCPeerConnection(PeerRSA.config,PeerRSA.pcOptions);
      this.cast_.pc.onicecandidate = function(evt){
        if(evt.candidate) {
          console.log(evt.candidate);
          var rtc = {cmd:"cast.b.ice",candidate:evt.candidate};
          if (PeerRSA.debug) {
            console.log(JSON.stringify(rtc));
          }
          this.sendSignal_(rtc);
        } else {
          console.log("end of onicecandidate");
        }
      }.bind(this);
     navigator.getUserMedia(media,this.gotMediaSuccess_.bind(this),this.gotMediaFailure_.bind(this));
    }
  }
  if(rtc.cmd == 'answer') {
    console.log(rtc.answer);
    var sdp = new RTCSessionDescription(rtc.answer); 
    this.cast_.pc.setRemoteDescription(sdp,this.onSetRemoteDescriptionSuccess_.bind(this),this.onSetRemoteDescriptionFailure_.bind(this));
  }
  if(rtc.cmd == 'catch.a.ice') {
    console.log(rtc.candidate);
    var rtcICE = new RTCIceCandidate(rtc.candidate);
    this.cast_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
  }
}
PeerRSA.B.prototype.onAddIceCandidateSuccess_ = function() {
  console.log('onAddIceCandidateSuccess_ success');
}
PeerRSA.B.prototype.onAddIceCandidateFailure_ = function(e) {
  console.error('onAddIceCandidateSuccess_',e);
}

PeerRSA.B.prototype.gotMediaSuccess_ = function (stream) {
  if (PeerRSA.debug) {
    console.log(stream);
  }
  this.cast_ = this.cast_ || {};
  console.log(PeerRSA.config);
  console.log(PeerRSA.pcOptions);
  this.cast_.pc.addStream(stream);
  var castOptions = {mandatory: {OfferToReceiveVideo:false, OfferToReceiveAudio:false}};
  this.cast_.pc.createOffer(this.offerSuccess_.bind(this),this.offerFailure_.bind(this),castOptions);
}

PeerRSA.B.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
}

PeerRSA.B.prototype.offerSuccess_ = function (offer) {
  this.cast_.pc.setLocalDescription(offer,
  function () {
    console.log('setLocalDescription success');
    var rtc = {cmd:"offer",offer:offer};
    this.sendSignal_(rtc);
  }.bind(this),
  function (e) {
    console.error(e);
  });
}

PeerRSA.B.prototype.offerFailure_ = function (e) {
  console.error(e);
}
PeerRSA.B.prototype.onSetRemoteDescriptionSuccess_ = function () {
  if (PeerRSA.debug) {
    console.log(this);
  }
}
PeerRSA.B.prototype.onSetRemoteDescriptionFailure_ = function (e) {
  console.error(e);
}



PeerRSA.Key.A.createKey = function (cb) {
  if (PeerRSA.debug) {
    console.log(cb);
  }
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
    var hashStrARaw = aKeyStr + pubKey;
    var hashStrA = hashStrARaw.replace(/[\n]/g, '').replace(/[\r]/g, '').replace(/\s+/g, '');
    if (PeerRSA.debug) {
      console.log('hashStrARaw=<'+hashStrARaw + '>');
      console.log('hashStrA=<' + hashStrA +'>');
    }
    var token_a = KJUR.crypto.Util.sha256(hashStrA);
    //console.log(token_a);

    var aOldTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.token'));
    //console.log(aOldTokens);
    aOldTokens = aOldTokens || {};
    //console.log(aOldTokens);
    aOldTokens['t_' + token_a] = pubKey;
    localStorage.setItem('rtc.PeerRSA.A.token',JSON.stringify(aOldTokens));

    // token@b wait signal sha(B.pub + A.pub)
    var hashStrBRaw = pubKey + aKeyStr;
    var hashStrB = hashStrBRaw.replace(/[\r]/g, '').replace(/[\n]/g, '').replace(/\s+/g, '');
    if (PeerRSA.debug) {
      console.log('hashStrBRaw=<'+hashStrBRaw + '>');
      console.log('hashStrB=<' + hashStrB +'>');
    }
    var token_b = KJUR.crypto.Util.sha256(hashStrB);
    //console.log(token_b);

    var bOldTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.token'));
    //console.log(bOldTokens);
    bOldTokens = bOldTokens || {};
    //console.log(bOldTokens);
    bOldTokens['t_' + token_b] = pubKey;
    localStorage.setItem('rtc.PeerRSA.B.token',JSON.stringify(bOldTokens));
    

    var aOldPairs = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.pair'));
    //console.log(aOldPairs);
    aOldPairs = aOldPairs || {};
    //console.log(aOldPairs);
    aOldPairs['t_' + token_a] = 't_' + token_b;
    localStorage.setItem('rtc.PeerRSA.A.pair',JSON.stringify(aOldPairs));

    var bOldPairs = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.pair'));
    //console.log(bOldPairs);
    bOldPairs = bOldPairs || {};
    //console.log(bOldPairs);
    bOldPairs['t_' + token_b] = 't_' + token_a;
    localStorage.setItem('rtc.PeerRSA.B.pair',JSON.stringify(bOldPairs));
    
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
      if (PeerRSA.debug) {
        console.log(result);
      }
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
  if (PeerRSA.debug) {
    console.log(cb);
  }
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
    if (PeerRSA.debug) {
      console.log(key);
      console.log(key.publicKey);
      console.log(key.privateKey);
    }
    window.crypto.subtle.exportKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    key.publicKey //can be a publicKey or privateKey, as long as extractable was true
    )
    .then(function(keydata){
      //returns the exported key data
      if (PeerRSA.debug) {
        console.log(keydata);
      }
      var keyObj = KEYUTIL.getKey(keydata);
      if (PeerRSA.debug) {
        console.log(keyObj);
      }
      var pem = KEYUTIL.getPEM(keyObj);
      if (PeerRSA.debug) {
        console.log(pem);
      }
      localStorage.setItem('rtc.PeerRSA.A.key.public',pem);
      if (PeerRSA.debug) {
        console.log( typeof cb);
      }
      if (typeof cb == 'function') {
        cb('success');
      }
      if (typeof PeerRSA.Key.A.onLoadCheckSuccess == 'function') {
        PeerRSA.Key.A.onLoadCheckSuccess('success');
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
      if (PeerRSA.debug) {
        console.log(keydata);
      }
      var keyObj = KEYUTIL.getKey(keydata);
      if (PeerRSA.debug) {
        console.log(keyObj);
      }
      var pem = KEYUTIL.getPEM(keyObj,"PKCS8PRV");
      if (PeerRSA.debug) {
        console.log(pem);
      }
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
