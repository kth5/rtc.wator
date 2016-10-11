var PeerRSA = PeerRSA || {};

/*
* configs
*/
PeerRSA.debug = PeerRSA.debug || false;
PeerRSA.uri = PeerRSA.uri || {};
PeerRSA.uri.a = PeerRSA.uri.a || 'wss://' + location.host + '/rtc/wss/a';
PeerRSA.uri.b = PeerRSA.uri.b || 'wss://' + location.host + '/rtc/wss/b';
PeerRSA.config = PeerRSA.config || {'iceServers': [{'url': 'stun:stun3.l.google.com:19302'},{'url': 'stun:stun.1.google.com:19302'}]};
PeerRSA.pcOptions = { optional: [{DtlsSrtpKeyAgreement: true} ] };
//PeerRSA.pcOptions = {};

/*
* prototype
*/

PeerRSA.Key = PeerRSA.Key ||{};
PeerRSA.Key.A = PeerRSA.Key.A || {};
PeerRSA.Key.A.createKey = function (cb) {
}
PeerRSA.Key.A.readKeyStr = function () {
}
PeerRSA.Key.A.onLoadCheckSuccess = function() {
}
PeerRSA.Key.B = PeerRSA.Key.B || {};
PeerRSA.Key.B.addKey = function (rawPubKey) {
}
PeerRSA.Key.B.getRemoteDevices = function (cb) {
}
PeerRSA.Key.B.getPairDevices = function () {
}


/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = function (token) {
}
/*
 PeerRSA.A.connect config {A:{video:{},audio:{}},B:{video:{},audio:{}}}
*/
PeerRSA.A.prototype.connect = function (config) {
}

PeerRSA.A.prototype.signalOpened = function (evt) {
}
PeerRSA.A.prototype.signalClosed = function (evt) {
}
PeerRSA.A.prototype.onaddstream = function (src) {
}

/*
  PeerRSA.B is Peer import RSA key.
*/
PeerRSA.B = function (token) {
}
/*
 PeerRSA.B.standby config {video:{},audio:{}}
*/
PeerRSA.B.prototype.standby = function (config) {
}
PeerRSA.B.prototype.signalOpened = function (evt) {
}
PeerRSA.B.prototype.signalClosed = function (evt) {
}
PeerRSA.B.prototype.onaddstream = function (src) {
}


