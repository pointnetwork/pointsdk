// @ts-ignore
import polyfill from "webextension-polyfill";

global.browser = polyfill;

import point from "pointsdk/pointsdk";

import ethereum from "./provider";

import cfwindow from "./confirmation-window";

const version = browser.runtime.getManifest().version;

window.eval(
    `window.ethereum = (${ethereum.toString()})(window.location.origin);`,
);
window.eval(
    `window.point = (${point.toString()})(window.location.origin, '${version}');`,
);

document.addEventListener("DOMContentLoaded", cfwindow);
