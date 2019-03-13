let bg = chrome.extension.getBackgroundPage();

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        console.log(tabs[0]);
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

function getCSPFromDOM() {
    let toReturnPromise = new Promise((resolve, reject) => {
        sendMessageToContentScript({action: 'getCSPMeta'}, function(result) {
            if (result.containsCSP) {
                resolve(result.directives);
            } else {
                resolve('');
            }
        });
    });
    return toReturnPromise;
}

function getCSPFromHeaders() {
    let toReturnPromise = new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            let url = tabs[0].url;
            let headers = bg.getCSPHeader(url);
            resolve(headers);
        }); 
    });
    return toReturnPromise;
}

Promise.all([getCSPFromHeaders(), getCSPFromDOM()]).then(values => {
    let directives = values[0] || values[1];
    console.log('directives: ', directives);
})