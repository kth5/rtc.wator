var PeerRSA = PeerRSA || {};
/*
  PeerRSA.A is Peer create RSA key.
*/
PeerRSA.A = PeerRSA.A || {};
PeerRSA.A.createKey = function createKey() {
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
  var token = KJUR.crypto.Util.sha512(pubKeyStr);
  //console.log(token);
  localStorage.setItem('rtc.PeerRSA.A.token',token);
}

