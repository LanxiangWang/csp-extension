let map = new Map();

let isCheckedMap = new Map();

chrome.webRequest.onHeadersReceived.addListener(details => {
    if (details.type === 'main_frame') {
        let headers = details.responseHeaders;
        let url = details.url;
        
        headers.map(header => {
            if (header.name === 'content-security-policy') {
                map.set(url, header.value);
                console.log(url, ' contains CSP: ', header.value);
            }
        })
        
        if (!isCheckedMap.get(url)) {
            let toAdded = {
                name: 'content-security-policy',
                value: "default-src 'none';"
            }
            details.responseHeaders.push(toAdded);
    
            console.log(url, ' added csp, ', details.responseHeaders);
    
            return { responseHeaders: details.responseHeaders };
        }
    }
    
}, {urls: ["<all_urls>"]}, ["responseHeaders", "extraHeaders", "blocking"]);

function getCSPHeader(url) {
    return map.get(url) || '';
}

function checkUrl(url) {
    isCheckedMap.set(url, true);
}