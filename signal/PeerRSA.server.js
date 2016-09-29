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


PeerRSA.castConn = PeerRSA.castConn || {};
PeerRSA.catchConn = PeerRSA.catchConn || {};

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    /*
      cast signal.
    */
    var connCast = request.accept('wator.rtc.cast', request.origin);
    console.log((new Date()) + 'Cast Connection accepted.');
    var key = 'cast.' + request.key;
    PeerRSA.castConn[key] = connCast;
    connCast.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    });
    connCast.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connCast.remoteAddress + ' disconnected.');
    });

    /*
      catch signal.
    */
    var connCatch = request.accept('wator.rtc.catch', request.origin);
    console.log((new Date()) + 'Catch Connection accepted.');
    var key = 'catch.' + request.key;
    PeerRSA.catchConn[key] = connCatch;
    connCatch.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    });
    connCatch.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connCatch.remoteAddress + ' disconnected.');
    });
});
