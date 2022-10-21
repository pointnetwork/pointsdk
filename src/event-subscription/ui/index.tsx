import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import getSdk from 'pointsdk/pointsdk/sdk';

const version = browser.runtime.getManifest().version;
const point = getSdk('https://event-subscription', version, null);

const renderWindow = () => {
    try {
        window.point = point;
        ReactDOM.render(<App />, document.getElementById('point-event-subscription'));
    } catch (e) {
        console.error('Failed to render event subscription window', e);
    }
};

document.addEventListener('DOMContentLoaded', renderWindow);
