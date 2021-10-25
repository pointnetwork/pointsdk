document.addEventListener('DOMContentLoaded', () => {
    const csrf = document.getElementsByName('_csrf')[0];
    const token = csrf?.getAttribute('content');

    const payload = {type: 'csrf-add', value: token};

    browser.runtime.sendMessage(payload);
})
