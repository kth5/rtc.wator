#!/usr/bin/env nodejs
var WebSocketServer = require('websocket').server;
var http = require('http');

var PeerRSA = PeerRSA || {};
PeerRSA.A = PeerRSA.A || {};
PeerRSA.B = PeerRSA.B || {};
PeerRSA.A.wait = PeerRSA.A.wait || {};
PeerRSA.B.wait = PeerRSA.B.wait || {};

var serverA = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
serverA.listen(28081, function() {
  console.log((new Date()) + ' Server A is listening on port 28081');
});

wsServerA = new WebSocketServer({
  httpServer: serverA,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServerA.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  /*
  A signal.
  */
  var connA = request.accept('wator.rtc.a', request.origin);
  console.log((new Date()) + 'A Connection accepted.');
  var key = 'a.' + request.key;
  PeerRSA.A[key] = connA;
  connA.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('<<A::Received Message: ' + message.utf8Data);
      var msgJson = JSON.parse(message.utf8Data);
      // token waiting.
      if(msgJson && msgJson.signal && msgJson.signal.wait) {
        //console.log(msgJson);
        var wait = msgJson.signal.wait;
        for(var i = 0;i < wait.length;i++) {
          var token = wait[0];
          PeerRSA.A.wait[token] = connA;
        }
      }
      // check token
      if(msgJson && msgJson.token) {
        var dist = msgJson.token;
        var conDist = PeerRSA.B.wait[dist];
        if(conDist) {
          conDist.sendUTF(message.utf8Data);
        }
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
  });
  connA.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connA.remoteAddress + ' disconnected.');
  });
});

var serverB = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
serverB.listen(28082, function() {
  console.log((new Date()) + ' server B is listening on port 28082');
});

wsServerB = new WebSocketServer({
  httpServer: serverB,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

wsServerB.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  /*
  B signal.
  */
  var connB = request.accept('wator.rtc.b', request.origin);
  console.log((new Date()) + 'B Connection accepted.');
  var key = 'b.' + request.key;
  PeerRSA.B[key] = connB;
  connB.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('<<B::Received Message: ' + message.utf8Data);
      var msgJson = JSON.parse(message.utf8Data);
      // token waiting.
      if(msgJson && msgJson.signal && msgJson.signal.wait) {
        //console.log(msgJson);
        var wait = msgJson.signal.wait;
        for(var i = 0;i < wait.length;i++) {
          var token = wait[0];
          PeerRSA.B.wait[token] = connB;
        }
      }
      // check token
      if(msgJson && msgJson.token) {
        var dist = msgJson.token;
        var conDist = PeerRSA.A.wait[dist];
        if(conDist) {
          conDist.sendUTF(message.utf8Data);
        }
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
  });
  connB.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connB.remoteAddress + ' disconnected.');
  });
});
