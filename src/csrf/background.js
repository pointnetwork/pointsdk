const createCsrfHandler = (csrfToken) => {
    return addCsrfHeader = (e) => {
        const csrfTokenHeader = {name: 'csrf-token', value: csrfToken}
        e.requestHeaders.push(csrfTokenHeader);
        return {requestHeaders: e.requestHeaders};
    }
}

const incomming = (csrfToken) => {
    browser.webRequest.onBeforeSendHeaders.addListener(
        createCsrfHandler(csrfToken),
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]
    );
}

browser.runtime.onMessage.addListener(incomming);