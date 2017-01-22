// Actions.js
'use strict'
import createPeerConnection from './createPeerConnection.js';
const addAnswerPeer = (remoteClientId, config) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const peerConnection = createPeerConnection(config);
            if(peerConnection) {
                const peer = { remoteClientId, peerConnection };
                dispatch(addPeer(peer))
                .then(resolve);
            } else {
                reject(new Error('Create peerConnection failed.'));
            }
        });
    };
}
const addCallPeerAndSetup = (remoteClientId, config) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const peerConnection = createPeerConnection(config);
            if(peerConnection) {
                const peer = { remoteClientId, peerConnection };
                return setupPeer(peer)
                .then(peer => dispatch(addPeer(peer)))
                .then(resolve);
            } else {
                reject(new Error('Create peerConnection failed.'));
            }
        });
    };
}
const setupPeer = (peer, isAnswerPeer) => {
    return new Promise((resolve, reject) => {
        let offer = undefined;
        let createDescriptionPromise = undefined;
        if(isAnswerPeer) {
            createDescriptionPromise = peer.peerConnection.createAnswer();
        } else {
            createDescriptionPromise = peer.peerConnection.createOffer();
        }
        createDescriptionPromise
        .then(
            createdDescription => {
                offer = createdDescription;
                return peer.peerConnection.setLocalDescription(createdDescription);
            },
            () => { reject(new Error('createOffer() failed.')); }
        )
        .then(
            () => { resolve(Object.assign({ offer }, peer)); },
            () => { reject(new Error('setLocalDescription() failed.')); }
        )
    });
}
const addPeer = (peer) => {
    return (dispatch, getState) => {
        dispatch({ type: 'ADD_PEER', peer });
        return new Promise((resolve, reject) => {
            resolve(peer);
        });
    };
}

export { addCallPeerAndSetup, addAnswerPeer, setupPeer };
export default { addCallPeerAndSetup, addAnswerPeer, setupPeer };
