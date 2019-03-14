let hasCSPMeta = false;
let cspDirectives = '';

let shouldStop = localStorage.getItem('stopStatus') || 'true';

console.log('get stopStatus from local storage: ', shouldStop);
console.log('add listener');
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    console.log('contentScript receives message: ', req);
    if (req.action === 'getCSPMeta') {
        if (hasCSPMeta) {
            sendResponse({
                containsCSP: true,
                directives: cspDirectives
            });
        } else {
            sendResponse({
                containsCSP: false,
                directives: cspDirectives
            });
        }
    }

    if (req.action === 'changeStopStatus') {
        localStorage.setItem('stopStatus', false);
    }

    if (req.action === 'refresh') {
        location.reload();
    }
});

console.log('stop', document);






window.onload = function() {
    let cspMeta = $('meta[http-equiv="Content-Security-Policy"')[0];
    if (cspMeta) {
        hasCSPMeta = true;
        cspDirectives = cspMeta.content;
    }

    if (shouldStop === 'true') {
        injectLoadingPage();
    }
};

function injectLoadingPage() {
    console.log('prepare to inject');
    let body = document.createElement('body');
    body.setAttribute('class', 'loading_body');
    let h1 = document.createElement('h1');
    h1.innerHTML = "hello";
    body.appendChild(h1);
    let html = document.getElementsByTagName('html')[0];
    let oldBody = document.getElementsByTagName('body')[0];
    html.removeChild(oldBody);
    html.appendChild(body);
}