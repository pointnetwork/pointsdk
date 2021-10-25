!function(){const e={};browser.runtime.onMessage.addListener((r=>{var s;"csrf-add"!=r.type||e[r.value]||(browser.webRequest.onBeforeSendHeaders.addListener((s=r.value,e=>{const r={name:"X-CSRF-TOKEN",value:s};return e.requestHeaders.push(r),{requestHeaders:e.requestHeaders}}),{urls:["<all_urls>"]},["blocking","requestHeaders"]),e[r.value]=!0)}))}();
//# sourceMappingURL=background.js.map
