#!/usr/bin/env node
'use strict'
const Express = require('express');
const Http = require('http');
const SocketServer = require('../src/SocketServer.js');

const App = function() {};
App.expressStaticRoutes = [
    {path: '/js/', serverPath: '/dist/js'},
    {path: '/', serverPath: '/dist/html/'},
    {path: '/(:roomId)?', serverPath: '/dist/html/'},
];

App.prototype.server = Express();
App.prototype.run = function() {
    const server = this.server;
    App.expressStaticRoutes.forEach(function(route) {
        server.use(route.path, Express.static(__dirname + route.serverPath));
    });
    server.listen(3000);
    console.log('Web listening on 3000 port ...');
    SocketServer.server.listen(5566);
    console.log('Socket listening on 5566 port ...');
};
module.exports = App;

const app = new App();
app.run();
