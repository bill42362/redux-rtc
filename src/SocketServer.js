// SocketServer.js
'use strict'
const Express = require('express');
const Http = require('http');
const SocketIO = require('socket.io');

const httpServer = Http.createServer(Express());
const server = SocketIO(httpServer).of('/peer');
const rooms = {};

const clientHandlers = [
    {event: 'disconnect', handler: function(reason) {
        const client = this;
        const query = client.handshake.query;
        const roomId = query.room_id;
        const clientId = query.client_id;
        const clientIds = rooms[roomId];
        rooms[roomId] = clientIds.filter(function(id) {
            return clientId != id;
        });
        server.in(roomId).emit('peerIds', rooms[roomId]);
    }},
    {event: 'handshake', handler: function(pack) {
        const client = this;
        const query = client.handshake.query;
        server.in(query.room_id).emit('handshake', pack);
    }},
    {event: 'candidate', handler: function(pack) {
        const client = this;
        const query = client.handshake.query;
        server.in(query.room_id).emit('candidate', pack);
    }},
];

const serverHandlers = [
    {event: 'connection', handler: function(client) {
        const query = client.handshake.query;
        const roomId = query.room_id;
        const clientId = query.client_id;
        client.join(roomId, function(error) {
            if(error) { console.log(error); return; }
            if(!rooms[roomId]) { rooms[roomId] = []; }
            rooms[roomId].push(clientId);
            server.in(roomId).emit('peerIds', rooms[roomId]);
        });
        clientHandlers.forEach(handler => {
            client.on(handler.event, handler.handler);
        });
    }},
];

serverHandlers.forEach(function(handler) {
    server.on(handler.event, handler.handler);
});

module.exports = server;
