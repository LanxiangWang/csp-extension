let bg = chrome.extension.getBackgroundPage();
let url = '';

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
            url = tabs[0].url;
            let headers = bg.getCSPHeader(url);
            resolve(headers);
        }); 
    });
    return toReturnPromise;
}


document.getElementById('testBtn').addEventListener('click', function() {
    if (url === '') {
        console.log('error on url');
    } else {
        bg.checkUrl(url);
    }

    sendMessageToContentScript({action: 'changeStopStatus'}, function() {
        console.log('stop status has been changed');
    });

    sendMessageToContentScript({action: 'refresh'}, function() {
        console.log('refresh current page');
    })
})

Promise.all([getCSPFromHeaders(), getCSPFromDOM()]).then(values => {
    let directives = values[0] || values[1];
    console.log('directives: ', directives);
})