// @ts-ignore 
import polyfill from 'webextension-polyfill';

global.browser = polyfill;

import point from 'pointsdk/pointsdk';

window.eval(`window.point = (${ point.toString() })();`);

// const patchMethods = (object: object) => {
//     const result = {} as {[key: string]: unknown};

//     for (const [key, value] of Object.entries(object)) {
//         if (value && typeof value === 'object') {
//             result[key] = patchMethods(value);
//         } else if (value && typeof value === 'function') {
//             if (value.constructor.name === 'AsyncFunction') {
//                 result[key] = async (...args: any[]) => window.eval(`JSON.parse(${ JSON.stringify(await value(...args)) })`);
//             } else {
//                 result[key] = (...args: any[]) => window.eval(`JSON.parse(${ JSON.stringify(value(...args)) })`);
//             }
//         } else {
//             result[key] = value;
//         }
//     }
//     return result;
// }

// // @ts-ignore // TODO: unable to find the below types
// window.wrappedJSObject.point = cloneInto(patchMethods(point), window, { cloneFunctions: true });

// // @ts-ignore
// window.wrappedJSObject.foo = cloneInto(
// // @ts-ignore
//     {bar: () => window.eval(`Promise.resolve(42)`)},
//     window,
//     { cloneFunctions: true }
// );
