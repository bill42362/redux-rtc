// App.js
'use strict'
import { Actions, Reducer } from '../../src/index.js';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
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
        if(clientId > newPeerId) {
            store.dispatch(Actions.addCallPeerAndSetup(newPeerId, sendCandidatePack))
            .then((peer) => {
                const pack = {senderId: clientId, targetPeer: peer, needAnswerPack: true};
                io.emit('handshake', pack);
            });
        } else {
            store.dispatch(Actions.addAnswerPeer(newPeerId, sendCandidatePack));
        }
    });
}
const processHandshakePack = (pack) => {
    const currentPeers = store.getState().peers;
    const targetPeer = currentPeers.filter(peer => pack.senderId === peer.remoteClientId)[0];
    if(targetPeer) {
        targetPeer.peerConnection.onaddstream = (event) => {
            const baseElement = document.getElementById('base');
            const video = document.createElement('video');
            video.src = window.URL.createObjectURL(event.stream);
            video.autoplay = true;
            video.play();
            baseElement.appendChild(video);
            console.log(video);
        };
        const setRemoteDescriptionPromise
            = targetPeer.peerConnection.setRemoteDescription(pack.targetPeer.offer);
        if(pack.needAnswerPack) {
            setRemoteDescriptionPromise
            .then(() => {
                return Actions.setupPeer(targetPeer, true)
                .then(peer => new Promise((resolve, reject) => {
                    const pack = {senderId: clientId, targetPeer: peer};
                    io.emit('handshake', pack);
                    resolve();
                }));
            });
        }
    }
}
const sendCandidatePack = pack => {
    io.emit('candidate', Object.assign({}, pack, {senderId: clientId}));
}
const processCandidatePack = pack => {
    const currentPeers = store.getState().peers;
    const targetPeer = currentPeers.filter(peer => pack.senderId === peer.remoteClientId)[0];
    if(targetPeer) {
        targetPeer.peerConnection.addIceCandidate(pack.candidate);
    }
}

const io = Socket(`http://localhost:5566/peer?room_id=${roomId}&client_id=${clientId}`);
const ioCallbacks = [
    {event: 'connect', callback: () => { console.log('connect()'); }},
    {event: 'peerIds', callback: processPeerIds},
    {event: 'handshake', callback: processHandshakePack},
    {event: 'candidate', callback: processCandidatePack},
    {event: 'disconnect', callback: () => { console.log('disconnect()'); }},
];
ioCallbacks.forEach(ioCallback => {
    io.on(ioCallback.event, ioCallback.callback);
});

var onReadyStateChange = function onReadyStateChange(e) {
    if(document.readyState == 'complete') {
        ReactDOM.render(
            <Provider store={store} >
                <div id='base'>
                </div>
            </Provider>,
            document.getElementById('app-root'),
            () => { }
        );
    }   
};
document.addEventListener('readystatechange', onReadyStateChange);
