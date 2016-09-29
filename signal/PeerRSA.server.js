#!/usr/bin/env nodejs
var WebSocketServer = require('websocket').server;
var http = require('http');

var PeerRSA = PeerRSA || {};

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(28081, function() {
    console.log((new Date()) + ' Server is listening on port 28081');
});

wsServer = new WebSocketServer({
    httpServer: server,
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


PeerRSA.A = PeerRSA.A || {};
PeerRSA.B = PeerRSA.B || {};

wsServer.on('request', function(request) {
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
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    });
    connA.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connA.remoteAddress + ' disconnected.');
    });

    /*
      B signal.
    */
    var connB = request.accept('wator.rtc.b', request.origin);
    console.log((new Date()) + 'B Connection accepted.');
    var key = 'b.' + request.key;
    PeerRSA.B[key] = connB;
    connB.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    });
    connB.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connB.remoteAddress + ' disconnected.');
    });
});
