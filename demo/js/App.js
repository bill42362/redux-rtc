// App.js
'use strict'
import { Actions, Reducer } from '../../src/index.js';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

const store = createStore(Reducer, applyMiddleware(ReduxThunk));
var onReadyStateChange = function onReadyStateChange(e) {
    if(document.readyState == 'complete') {
        store.dispatch(Actions.connectToRemoteId(0.5))
        .then((peer) => { console.log('peer:', peer, ', state:', store.getState()); });
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
