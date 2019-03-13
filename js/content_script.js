let hasCSPMeta = false;
let cspDirectives = '';

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
});

window.onload = function() {
    let cspMeta = $('meta[http-equiv="Content-Security-Policy"')[0];
    if (cspMeta) {
        hasCSPMeta = true;
        cspDirectives = cspMeta.content;
        // console.log('csp: ', cspMeta.content);
    }
};