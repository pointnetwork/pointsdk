const csrfHandlers = {};
const csrfValues = {};

const createCsrfHandler = (csrfToken) => {
    return (e) => {
        const csrfTokenHeader = {name: 'X-CSRF-TOKEN', value: csrfToken}
        e.requestHeaders.push(csrfTokenHeader);
        return {requestHeaders: e.requestHeaders};
    }
}

const handleMessage = (request) => {
    // and the listener is not already added then add listener
    // if the incomming reqest is for adding a new csrf token

    if(request.type == 'csrf-add' && (request.value != csrfValues[request.url])) {
        // remove previously registered listener if there is one
        if (csrfHandlers[request.url] && browser.webRequest.onBeforeSendHeaders.hasListener(csrfHandlers[request.url])) {
            browser.webRequest.onBeforeSendHeaders.removeListener(csrfHandlers[request.url]);
        }
        // add new listener
        csrfHandlers[request.url] = createCsrfHandler(request.value);
        csrfValues[request.url] = request.value;

        browser.webRequest.onBeforeSendHeaders.addListener(
            csrfHandlers[request.url],
            {urls: [`${request.url}/*`]},
            ["blocking", "requestHeaders"]
        );
    }
}

browser.runtime.onMessage.addListener(handleMessage);