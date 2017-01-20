// Actions.js
'use strict'
import createPeerConnection from './createPeerConnection.js';
const connectToRemoteId = (remoteClientId, config) => {
    return (dispatch, getState) => {
        return dispatch(addPeerConnection(remoteClientId, config))
        .then(offer => dispatch(setLocalDescription(remoteClientId, offer)))
        .then(({offer, peerConnection, remoteClientId}) => {
            // Send offer to Socket.io.
            console.log('offer:', offer, ', peerConnection:', peerConnection, ', remoteClientId:', remoteClientId);
        })
        .catch(error => { throw error; });
    };
}
const addPeerConnection = (remoteClientId, config) => {
    return (dispatch, getState) => {
        let peerConnection = createPeerConnection(config);
        dispatch({type: 'ADD_PEER_CONNECTION', peerConnection: { remoteClientId, peerConnection }});
        return peerConnection.createOffer();
    };
};
const setLocalDescription = (remoteClientId, offer) => {
    return (dispatch, getState) => {
        const peerConnections = getState();
        const peerConnectionObject = peerConnections.filter(peerConnection => {
            return remoteClientId === peerConnection.remoteClientId;
        })[0];
        return new Promise((resolve, reject) => {
            if(peerConnectionObject) {
                return peerConnectionObject.peerConnection.setLocalDescription(offer)
                .then(
                    () => { resolve(Object.assign({ offer }, peerConnectionObject));},
                    reject
                );
            } else {
                reject(new Error('setLocalDescription() peerConnection not found.'));
            }
        });
    };
};

export { connectToRemoteId };
export default { connectToRemoteId };
