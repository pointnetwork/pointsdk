// @ts-ignore
import polyfill from "webextension-polyfill";

global.browser = polyfill;

import point from "pointsdk/pointsdk";

const defaultCode = require('./inject.ts');

async function register( code: string) {
  return await browser.contentScripts.register({
    matches: ["<all_urls>"],
    js: [{code}],
    runAt: "document_start"
  });
}

register(defaultCode);

const version = browser.runtime.getManifest().version;

window.eval(`window.point = (${point.toString()})(window.location.origin, '${version}');`);
