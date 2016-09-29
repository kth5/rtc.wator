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
  this->signal_(msg);
}

/*
  PeerRSA.B is Peer import RSA key.
*/
PeerRSA.B = function () {
  PeerRSA.B.wss = PeerRSA.B.wss || new WebSocket(PeerRSA.uri,'wator.rtc.b');
}
PeerRSA.B.importKey = function (pubKey) {
  //
  var token = KJUR.crypto.Util.sha1(pubKey);
  var storageKey = 'rtc.PeerRSA.B.token.' + token;
  localStorage.setItem(storageKey,pubKey);
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
  var tokenA = localStorage.getItem('rtc.PeerRSA.A.token');
  var sigMsg = {token:tokenA,rtc:msg};
  this.wss.send(JSON.string(sigMsg));
}




