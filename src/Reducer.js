// Reducer.js
'use strict'
const defaultState = {
    peers: [ ],
};
const Reducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'UPDATE_CANDIDATE_PACK_SENDER':
            return Object.assign({}, state, {candidatePackSender: action.candidatePackSender});
        case 'ADD_PEER':
            return Object.assign({}, state, {peers: [...state.peers, action.peer]});
        default:
            return state;
    }
};
export { Reducer };
export default Reducer;
