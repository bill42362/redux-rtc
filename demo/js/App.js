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
const store = createStore(Reducer, applyMiddleware(ReduxThunk));

const processPeerIds = (peerIds) => {
    const noSelfPeerIds = peerIds.filter(peerId => clientId != peerId);
    const currentPeers = store.getState().peers;
    const newPeerIds = noSelfPeerIds.filter(peerId => {
        return 0 === currentPeers.filter(currentPeer => peerId === currentPeer.remoteClientId).length;
    });
    newPeerIds.forEach(newPeerId => {
        store.dispatch(Actions.addPeerAndSetup(newPeerId))
        .then((peer) => {
            const pack = {senderId: clientId, targetPeer: peer};
            io.emit('handshake', pack);
        });
    });
}
const processHandshakePack = (pack) => {
    const currentPeers = store.getState().peers;
    const targetPeer = currentPeers.filter(peer => pack.senderId === peer.remoteClientId)[0];
    targetPeer && targetPeer.peerConnection.setRemoteDescription(pack.targetPeer.offer)
    .then(
        (arg) => { console.log('setRemoteDescription() arg:', arg); },
        (error) => { throw error; }
    );
}

const io = Socket(`http://localhost:5566/peer?room_id=${roomId}&client_id=${clientId}`);
const ioCallbacks = [
    {event: 'connect', callback: () => { console.log('connect()'); }},
    {event: 'peerIds', callback: processPeerIds},
    {event: 'handshake', callback: processHandshakePack},
    {event: 'disconnect', callback: () => { console.log('disconnect()'); }},
];
ioCallbacks.forEach(ioCallback => {
    io.on(ioCallback.event, ioCallback.callback);
});

var onReadyStateChange = function onReadyStateChange(e) {
    if(document.readyState == 'complete') {
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
