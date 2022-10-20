import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
// PointSDK
import getSdk from 'pointsdk/pointsdk/sdk';
import getEthProvider from 'pointsdk/pointsdk/ethProvider';
import getSolanaProvider from 'pointsdk/pointsdk/solanaProvider';
const version = browser.runtime.getManifest().version;
const point = getSdk('https://point', version);
const ethereum = getEthProvider();
const solana = getSolanaProvider();

void browser.tabs.query({active: true, currentWindow: true}).then(() => {
    window.point = point;
    window.ethereum = ethereum;
    window.solana = solana;
    ReactDOM.render(<App />, document.getElementById('popup'));
});
