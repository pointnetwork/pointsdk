// @ts-ignore
import polyfill from 'webextension-polyfill';

global.browser = polyfill;

import point from 'pointsdk/pointsdk';

window.eval(`window.point = (${ point.toString() })(window.location.origin);`);
