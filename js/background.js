let map = new Map();
let originalCspMap = new Map();
let isCheckedMap = new Map();

chrome.webRequest.onHeadersReceived.addListener(details => {
    if (details.type === 'main_frame') {
        let headers = details.responseHeaders;
        let url = details.url;

        
        if (!isCheckedMap.get(url)) {
            headers.map(header => {
                if (header.name === 'content-security-policy') {
                    originalCspMap.set(url, header.value);
                    console.log(url, ' contains CSP: ', header.value);
                }
            })

            let toAdded = {
                name: 'content-security-policy',
                value: "default-src 'none';"
            }
            details.responseHeaders.push(toAdded);
    
            console.log(url, ' added csp, ', details.responseHeaders);
    
            return { responseHeaders: details.responseHeaders };
        } else {
            
            let index = findCSPObject(details.responseHeaders);
            console.log('use modified csp: ', map.get(url), 'and index is: ', index);
            if (index === -1) {
                details.responseHeaders.push({
                    name: 'content-security-policy',
                    value: map.get(url)
                });
            } else {
                details.responseHeaders[index] = {
                    name: 'content-security-policy',
                    value: map.get(url)
                }
            }
            console.log('responseHeaders: ', details.responseHeaders);
            return { responseHeaders: details.responseHeaders };
        }
    }
    
}, {urls: ["<all_urls>"]}, ["responseHeaders", "extraHeaders", "blocking"]);

function getCSPHeader(url) {
    return {
        original: originalCspMap.get(url) || '',
        modified: map.get(url) || originalCspMap.get(url) || ''
    }
}

function checkUrl(url) {
    isCheckedMap.set(url, true);
}

function modifyCSP(url, modifiedCSP) {
    map.set(url, modifiedCSP);
    console.log('modified: ', map);
}

function findCSPObject(headers) {
    let index = -1;
    headers.map((header, i) => {
        if (header.name === 'content-security-policy') {
            index = i;
        }
    })
    return index;
}