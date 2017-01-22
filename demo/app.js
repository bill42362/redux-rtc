#!/usr/bin/env node
'use strict'
const Express = require('express');
const Http = require('http');

const App = function() {};
App.expressStaticRoutes = [
    {path: '/js/', serverPath: '/dist/js'},
    {path: '/', serverPath: '/dist/html/'},
    {path: '/(:roomId)?', serverPath: '/dist/html/'},
];
App.ioHandlers = [
    {event: 'connection', handler: function(client) {
        const app = this;
        const query = client.handshake.query;
        const roomId = query.room_id;
        const clientId = query.client_id;
        client.join(roomId, function(error) {
            if(error) { console.log(error); return; }
            if(!app.rooms[roomId]) { app.rooms[roomId] = []; }
            app.rooms[roomId].push(clientId);
            app.io.in(roomId).emit('peerIds', app.rooms[roomId]);
        }.bind(this));
        client.on('disconnect', function(reason) {
            const client = this;
            const query = client.handshake.query;
            const roomId = query.room_id;
            const clientId = query.client_id;
            const clientIds = app.rooms[roomId];
            app.rooms[roomId] = clientIds.filter(function(id) {
                return clientId != id;
            });
            app.io.in(roomId).emit('peerIds', app.rooms[roomId]);
        });
    }},
];

App.prototype.server = Express();
App.prototype.socketServer = Http.createServer(Express());
App.prototype.rooms = {};
App.prototype.run = function() {
    const server = this.server;
    App.expressStaticRoutes.forEach(function(route) {
        server.use(route.path, Express.static(__dirname + route.serverPath));
    });
    server.listen(3000);
    console.log('Web listening on 3000 port ...');

    this.io = require('socket.io')(this.socketServer).of('/peer');
    App.ioHandlers.forEach(function(ioHandler) {
        this.io.on(ioHandler.event, ioHandler.handler.bind(this));
    }.bind(this));
    this.socketServer.listen(5566);
    console.log('Socket listening on 5566 port ...');
};
module.exports = App;

const app = new App();
app.run();
