// Reducer.js
'use strict'
import createPeerConnection from './createPeerConnection.js';
import Actions from './Actions.js';
const firstPeerConnection = createPeerConnection();
const defaultState = {
    peerConnections: [ firstPeerConnection ],
};
const Reducer = (state = defaultState, action) => {
    switch(action.type) {
        default:
            return state;
    }
};
export { Reducer };
export default Reducer;
