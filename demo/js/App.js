// App.js
'use strict'
import { Actions, Reducer } from '../../src/index.js';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import Core from './Core.js';

import Socket from 'socket.io-client';

const roomId = location.pathname.replace(/\//g, '');
const clientId = Core.newUuid();
const io = Socket(`http://localhost:5566/peer?room_id=${roomId}&client_id=${clientId}`);
const ioCallbacks = [
    {event: 'connect', callback: () => { console.log('connect()'); }},
    {event: 'peerIds', callback: (peerIds) => { console.log('peerIds() peerIds:', peerIds); }},
    {event: 'disconnect', callback: () => { console.log('disconnect()'); }},
];
ioCallbacks.forEach(ioCallback => {
    io.on(ioCallback.event, ioCallback.callback);
});

const store = createStore(Reducer, applyMiddleware(ReduxThunk));
var onReadyStateChange = function onReadyStateChange(e) {
    if(document.readyState == 'complete') {
        store.dispatch(Actions.addPeerAndSetup(0.5))
        .then((peer) => { console.log('peer:', peer, ', state:', store.getState()); });
        ReactDOM.render(
            <Provider store={store} >
                <div></div>
            </Provider>,
            document.getElementById('app-root'),
            () => { }
        );
    }   
};
document.addEventListener('readystatechange', onReadyStateChange);
