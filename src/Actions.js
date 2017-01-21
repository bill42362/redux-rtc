// Actions.js
'use strict'
import createPeerConnection from './createPeerConnection.js';
const connectToRemoteId = (remoteClientId, config) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const peerConnection = createPeerConnection(config);
            if(peerConnection) {
                const peer = { remoteClientId, peerConnection };
                return setupPeer(peer)
                .then(peer => dispatch(addPeer(peer)))
                .then(peer => {
                    // Send offer to socket.io.
                    console.log('peer:', peer);
                    resolve(peer);
                });
            } else {
                reject(new Error('Create peerConnection failed.'));
            }
        });
    };
}
const setupPeer = (peer) => {
    return new Promise((resolve, reject) => {
        let offer = undefined;
        peer.peerConnection.createOffer()
        .then(
            createdOffer => {
                offer = createdOffer;
                return peer.peerConnection.setLocalDescription(createdOffer);
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

export { connectToRemoteId };
export default { connectToRemoteId };
