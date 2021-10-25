document.addEventListener('DOMContentLoaded', () => {
    const csrf = document.getElementsByName('_csrf')[0];
    const token = csrf?.getAttribute('content');

    browser.runtime.sendMessage(token);
})
