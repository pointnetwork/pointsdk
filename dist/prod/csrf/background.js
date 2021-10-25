browser.runtime.onMessage.addListener((e=>{browser.webRequest.onBeforeSendHeaders.addListener((e=>addCsrfHeader=r=>{const s={name:"csrf-token",value:e};return r.requestHeaders.push(s),{requestHeaders:r.requestHeaders}})(e),{urls:["<all_urls>"]},["blocking","requestHeaders"])}));
//# sourceMappingURL=background.js.map
