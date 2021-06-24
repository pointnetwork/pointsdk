import point from 'pointsdk/sdk';

// @ts-ignore // TODO: unable to find the below types
window.wrappedJSObject.point = cloneInto(point, window, { cloneFunctions: true });
