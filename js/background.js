let map = new Map();

chrome.webRequest.onHeadersReceived.addListener(details => {
    if (details.type === 'main_frame') {
        let headers = details.responseHeaders;
        let url = details.url;
        
        headers.map(header => {
            if (header.name === 'content-security-policy') {
                map.set(url, header.value);
                console.log(url, ' contains CSP: ', header.value);
                return;
            }
        })
        
        console.log(url, ' does not contain csp');
    }
    
}, {urls: ["<all_urls>"]}, ["responseHeaders", "extraHeaders", "blocking"]);

function getCSPHeader(url) {
    return map.get(url) || '';
}