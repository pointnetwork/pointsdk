import React from 'react';
import browser from 'webextension-polyfill';

const {version} = browser.runtime.getManifest();

const Version = () => (version ? <span style={{opacity: 0.7}}>v{version}</span> : null);

export default Version;
