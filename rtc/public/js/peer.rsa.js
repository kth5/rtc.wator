/*
console.log(adapter.browserDetails);
console.log(navigator.getUserMedia);
console.log(RTCPeerConnection);
console.log(RTCSessionDescription);
console.log(RTCIceCandidate);
*/

var URL = window.URL || window.webkitURL;

PeerRSA.gatherDevice = function (cb) {
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices){
    for(let i = 0 ;i < devices.length;i++ ){
      if(devices[i].deviceId !== 'default' && devices[i].kind !== 'audiooutput') {
        if (PeerRSA.debug) {
          console.log(devices[i]);
        }
        if(typeof cb === 'function') {
          cb(devices[i]);
        }
      }
    }
  })
  .catch(function(err){
    console.error(err);
  });
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
    console.trace();
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
    this.catch_.pc.onnegotiationneeded = this.onCatchNegotiationNeeded_.bind(this);
    this.catch_.pc.onicecandidate = this.onCatchIce_.bind(this);
    this.catch_.pc.onconnectionstatechange = this.onCatchConnectionStateChange_.bind(this);
    this.catch_.pc.oniceconnectionstatechange = this.onCatchICEConnectionStateChange.bind(this);
    this.catch_.pc.onicegatheringstatechange = this.onCatchICEGatheringStateChange.bind(this);
    this.catch_.iceGo = false;
    this.catch_.pc.onaddstream = function (evt) {
      if (PeerRSA.debug) {
        console.log(evt);
      }
      console.log(evt);
      var src = URL.createObjectURL(evt.stream);
      console.log(src);
      this.onaddstream(src);
    }.bind(this);
  }
}
PeerRSA.A.prototype.onMediaType_ = function (config) {
  if(config) {  
    this.mediaConst = { 'mandatory': { 'OfferToReceiveAudio': false, 'OfferToReceiveVideo': false } };
    if(config.video) {
      this.mediaConst['mandatory']['OfferToReceiveVideo'] = true;
    }
    if(config.audio) {
      this.mediaConst['mandatory']['OfferToReceiveAudio'] = true;
    }
  }
}

PeerRSA.A.prototype.onCatchNegotiationNeeded_ = function () {
  this.cast_.pc.createOffer(this.offerSuccess_.bind(this),this.offerFailure_.bind(this));
}
PeerRSA.A.prototype.onCatchIce_ = function (evt) {
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
}

PeerRSA.A.prototype.gotMediaSuccess_ = function (stream) {
  if (PeerRSA.debug) {
    console.log(stream);
  }
  this.cast_.pc.addStream(stream);
}

PeerRSA.A.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
  console.trace();
}

PeerRSA.A.prototype.offerSuccess_ = function (offer) {
  this.cast_.pc.setLocalDescription(offer,
    function () {
      console.log('setLocalDescription success')
    }.bind(this),
    function (e) {
      console.error(e);
      console.trace();
  });
  var rtc = {cmd:"offer",offer:offer};
  this.sendSignal_(rtc);
}

PeerRSA.A.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
  console.trace();
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
    this.addIceCatch_(rtc.candidate);
  }
}
PeerRSA.A.prototype.onAddIceCandidateSuccess_ = function() {
  console.log('onAddIceCandidateSuccess_ success');
}
PeerRSA.A.prototype.onAddIceCandidateFailure_ = function(e) {
  console.error('onAddIceCandidateFailure_');
  console.error(e);
  console.trace();
}
PeerRSA.A.prototype.addIceCatch_ = function(candidate) {
  console.log(candidate);
  if(this.catch_.iceGo) {
    var rtcICE = new RTCIceCandidate(candidate);
    this.catch_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
  } else {
    // cache up ice before ready
    this.catch_.iceCache = this.catch_.iceCache || [];
    this.catch_.iceCache.push(candidate);
    this.catch_.iceTimer = this.catch_.iceTimer || setInterval(this.onIceCatchCacheCheck_.bind(this),100);
  }
}
PeerRSA.A.prototype.onIceCatchCacheCheck_ = function() {
  console.warn('!!!onIceCatchCacheCheck_!!!');
  if(this.catch_.iceGo) {
    if(this.catch_.iceCache.length >0) {
      var candidate = this.catch_.iceCache[0];
      this.catch_.iceCache.shift() ;
      var rtcICE = new RTCIceCandidate(candidate);
      this.catch_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
    } else {
      clearInterval(this.catch_.iceTimer);
      this.catch_.iceTimer = null;
    }
  }
}


PeerRSA.A.prototype.onSetRemoteDescriptionSuccess_ = function() {
  console.log('onSetRemoteDescriptionSuccess_');
  console.log(this.mediaConst);
  this.catch_.pc.createAnswer(this.onCreateAnswerSuccess_.bind(this),this.onCreateAnswerError_.bind(this),this.mediaConst); 
  this.catch_.iceGo = true;
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
  console.trace();
}

PeerRSA.A.prototype.onCatchConnectionStateChange_ = function() {
  console.log(this.catch_.pc.connectionState);
  if(this.catch_.pc.connectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({connectionState:this.catch_.pc.connectionState});
    }
  }
}
PeerRSA.A.prototype.onCatchICEConnectionStateChange = function() {
  console.log(this.catch_.pc.iceConnectionState);
  if(this.catch_.pc.iceConnectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({iceConnectionState:this.catch_.pc.iceConnectionState});
    }
    if(typeof this.onConnected === 'function' && this.catch_.pc.iceConnectionState === 'connected') {
      this.onConnected({iceConnectionState:this.catch_.pc.iceConnectionState});
    }
  }
}
PeerRSA.A.prototype.onCatchICEGatheringStateChange = function() {
  console.log(this.catch_.pc.iceGatheringState);
  if(this.catch_.pc.iceConnectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({iceGatheringState:this.catch_.pc.iceGatheringState});
    }
  }
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
    console.trace();
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
      this.cast_ = this.cast_ || {};
      this.cast_.pc = new RTCPeerConnection(PeerRSA.config,PeerRSA.pcOptions);
      this.cast_.pc.onnegotiationneeded = this.onCastNegotiationNeeded_.bind(this);
      this.cast_.pc.onicecandidate = this.onCastIce_.bind(this);
      this.cast_.pc.onconnectionstatechange = this.onCastConnectionStateChange_.bind(this);
      this.cast_.pc.oniceconnectionstatechange = this.onCastICEConnectionStateChange.bind(this);
      this.cast_.pc.onicegatheringstatechange = this.onCastICEGatheringStateChange.bind(this);
      this.cast_.iceGo = false;
      navigator.getUserMedia(media,this.gotMediaSuccess_.bind(this),this.gotMediaFailure_.bind(this));
    }
  }
  if(rtc.cmd == 'answer') {
    console.log(rtc.answer);
    var sdp = new RTCSessionDescription(rtc.answer); 
    this.cast_.pc.setRemoteDescription(sdp,this.onSetRemoteDescriptionSuccess_.bind(this),this.onSetRemoteDescriptionFailure_.bind(this));
  }
  if(rtc.cmd == 'catch.a.ice') {
    this.addIceCast_(rtc.candidate);
  }
}
PeerRSA.B.prototype.onCastNegotiationNeeded_ = function() {
  var castOptions = {mandatory: {OfferToReceiveVideo:false, OfferToReceiveAudio:false}};
  this.cast_.pc.createOffer(this.offerSuccess_.bind(this),this.offerFailure_.bind(this),castOptions);
}


PeerRSA.B.prototype.onAddIceCandidateSuccess_ = function() {
  console.log('onAddIceCandidateSuccess_ success');
}
PeerRSA.B.prototype.onAddIceCandidateFailure_ = function(e) {
  console.error('onAddIceCandidateFailure_');
  console.error(e);
  console.trace();
}
PeerRSA.B.prototype.addIceCast_ = function(candidate) {
  console.log(candidate);
  if(this.cast_.iceGo) {
    var rtcICE = new RTCIceCandidate(candidate);
    this.cast_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
  } else {
    // cache up ice before ready
    this.cast_.iceCache = this.cast_.iceCache || [];
    this.cast_.iceCache.push(candidate);
    this.cast_.iceTimer = this.cast_.iceTimer || setInterval(this.onIceCastCacheCheck_.bind(this),100);
  }
}
PeerRSA.B.prototype.onIceCastCacheCheck_ = function() {
  console.warn('!!!onIceCatchCacheCheck_!!!');
  if(this.cast_.iceGo) {
    if(this.cast_.iceCache.length >0) {
      var candidate = this.cast_.iceCache[0];
      this.cast_.iceCache.shift() ;
      var rtcICE = new RTCIceCandidate(candidate);
      this.cast_.pc.addIceCandidate(rtcICE,this.onAddIceCandidateSuccess_.bind(this),this.onAddIceCandidateFailure_.bind(this));
    } else {
      clearInterval(this.cast_.iceTimer);
      this.cast_.iceTimer = null;
    }
  }
}

PeerRSA.B.prototype.onCastIce_ = function(evt){
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
}

PeerRSA.B.prototype.gotMediaSuccess_ = function (stream) {
  if (PeerRSA.debug) {
    console.log(stream);
  }
  console.log(PeerRSA.config);
  console.log(PeerRSA.pcOptions);
  this.cast_.pc.addStream(stream);
}

PeerRSA.B.prototype.gotMediaFailure_ = function (e) {
  console.error(e);
  console.trace();
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
    console.trace();
  });
}

PeerRSA.B.prototype.offerFailure_ = function (e) {
  console.error(e);
  console.trace();
}
PeerRSA.B.prototype.onSetRemoteDescriptionSuccess_ = function () {
  if (PeerRSA.debug) {
    console.log(this);
  }
  this.cast_.iceGo = true;
}
PeerRSA.B.prototype.onSetRemoteDescriptionFailure_ = function (e) {
  console.error(e);
  console.trace();
}


PeerRSA.B.prototype.onCastConnectionStateChange_ = function(evt) {
  console.log(this.cast_.pc.connectionState);
  if(this.cast_.pc.connectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({connectionState:this.cast_.pc.connectionState});
    }
  }
}
PeerRSA.B.prototype.onCastICEConnectionStateChange = function(evt) {
  console.log(this.cast_.pc.iceConnectionState);
  if(this.cast_.pc.iceConnectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({iceConnectionState:this.cast_.pc.iceConnectionState});
    }
    if(typeof this.onConnected === 'function' && this.cast_.pc.iceConnectionState === 'connected') {
      this.onConnected({iceConnectionState:this.cast_.pc.iceConnectionState});
    }
  }
}
PeerRSA.B.prototype.onCastICEGatheringStateChange = function(evt) {
  console.log(this.cast_.pc.iceGatheringState);
  if(this.cast_.pc.iceConnectionState) {
    if(typeof this.onNotice === 'function') {
      this.onNotice({iceGatheringState:this.cast_.pc.iceGatheringState});
    }
  }
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
    console.trace();
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
    console.trace();
    return {};
  }
}

PeerRSA.Key.B.getPairDevices = function () {
  //
  try {
    var bTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.pair')) || {};
    return Object.keys(bTokens);
  } catch(e) {
    console.error(e);
    console.trace();
    return null;
  }
}
PeerRSA.Key.B.removeDevice = function (token) {
  //
  try {
    var bPairs = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.pair')) || {};
    var rToken = bPairs[token];
    delete bPairs[token];
    localStorage.setItem('rtc.PeerRSA.B.pair',JSON.stringify(bPairs));

    var aPairs = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.pair')) || {};
    delete aPairs[rToken];
    localStorage.setItem('rtc.PeerRSA.A.pair',JSON.stringify(aPairs));

    var bTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.B.token')) || {};
    delete bTokens[token];
    localStorage.setItem('rtc.PeerRSA.B.token',JSON.stringify(bTokens));

    var aTokens = JSON.parse(localStorage.getItem('rtc.PeerRSA.A.token')) || {};
    delete aTokens[rToken];
    localStorage.setItem('rtc.PeerRSA.A.token',JSON.stringify(aTokens));
  } catch(e) {
    console.error(e);
    console.trace();
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
    console.trace();
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
    console.trace();
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
      console.trace();
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
      console.trace();
    });
  })
  .catch(function(err){
    console.error(err);
    console.trace();
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
