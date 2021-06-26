import point from 'pointsdk/pointsdk';

// @ts-ignore // TODO: unable to find the below types
window.wrappedJSObject.point = cloneInto(point, window, { cloneFunctions: true });
