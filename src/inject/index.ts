import { InjectPoint } from "./script";

(function inject() {
    const script = document.createElement("script");
    if (navigator.userAgent.includes("Chrome")) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let browser;
        script.text = `(${InjectPoint.toString()})();`;
    } else {
        script.src = browser.runtime.getURL("js/script.js");
    }
    document.documentElement.appendChild(script);
})();
