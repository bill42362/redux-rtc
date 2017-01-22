// Reducer.js
'use strict'
const defaultState = {
    peers: [ ],
};
const Reducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'ADD_PEER':
            return {peers: [...state.peers, action.peer]};
        default:
            return state;
    }
};
export { Reducer };
export default Reducer;
