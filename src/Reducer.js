// Reducer.js
'use strict'
const defaultState = {
    peerConnections: [ ],
};
const Reducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'ADD_PEER_CONNECTION':
            return [...state, action.peerConnection];
        default:
            return state;
    }
};
export { Reducer };
export default Reducer;
