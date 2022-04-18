import browser from "webextension-polyfill";
import getSdk from "pointsdk/pointsdk/sdk";
import getProvider from "pointsdk/pointsdk/provider";

window.point = getSdk(
    window.location.origin,
    browser.runtime.getManifest().version,
);

// TODO: types
window.ethereum = getProvider(window.location.origin);
