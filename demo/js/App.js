// App.js
'use strict'
import { Actions, Reducer } from '../../src/index.js';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

var onReadyStateChange = function onReadyStateChange(e) {
    if(document.readyState == 'complete') {
        let reduxRtcStore = createStore(Reducer);
        console.log('reduxRtcStore.getState():', reduxRtcStore.getState());
        ReactDOM.render(
            <Provider store={reduxRtcStore} >
                <div></div>
            </Provider>,
            document.getElementById('app-root'),
            () => { }
        );
    }   
};
document.addEventListener('readystatechange', onReadyStateChange);
