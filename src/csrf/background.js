const csrfHandlers = {};

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
    if(request.type == 'csrf-add' && !csrfHandlers[request.value]) {
        // add the csrf handler function
        browser.webRequest.onBeforeSendHeaders.addListener(
            createCsrfHandler(request.value),
            {urls: ["<all_urls>"]},
            ["blocking", "requestHeaders"]
        );
        csrfHandlers[request.value] = true;
    }
}

browser.runtime.onMessage.addListener(handleMessage);