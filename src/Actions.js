// Actions.js
'use strict'
import createPeerConnection from './createPeerConnection.js';
const addAnswerPeer = (remoteClientId, candidatePackSender, config) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const peerConnection = createPeerConnection(config);
            if(peerConnection) {
                const peer = { remoteClientId, peerConnection };
                peerConnection.onicecandidate = event => {
                    if(event.candidate) {
                        const pack = {candidate: event.candidate, peer};
                        candidatePackSender(pack);
                    }
                };
                dispatch(addPeer(peer))
                .then(resolve);
            } else {
                reject(new Error('Create peerConnection failed.'));
            }
        });
    };
}
const addCallPeerAndSetup = (remoteClientId, candidatePackSender, config) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const peerConnection = createPeerConnection(config);
            if(peerConnection) {
                const peer = { remoteClientId, peerConnection };
                peerConnection.onicecandidate = event => {
                    if(event.candidate) {
                        const pack = {candidate: event.candidate, peer};
                        candidatePackSender(pack);
                    }
                };
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
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
        .then(stream => {
            //peer.peerConnection.addTrack(track, stream);
            peer.peerConnection.addStream(stream);
            if(isAnswerPeer) {
                return peer.peerConnection.createAnswer();
            } else {
                return peer.peerConnection.createOffer();
            }
        })
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
