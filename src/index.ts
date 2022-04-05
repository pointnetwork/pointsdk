// @ts-ignore
import polyfill from "webextension-polyfill";

global.browser = polyfill;

import point from "pointsdk/pointsdk";

import ethereum from "./provider";


const version = browser.runtime.getManifest().version;

window.eval(`window.ethereum = (${ethereum.toString()})();`)
window.eval(`window.point = (${point.toString()})(window.location.origin, '${version}');`);
