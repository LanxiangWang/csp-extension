let bg = chrome.extension.getBackgroundPage();
let url = '';
let directiveMap = new Map();

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


// document.getElementById('testBtn').addEventListener('click', function() {
//     if (url === '') {
//         console.log('error on url');
//     } else {
//         bg.checkUrl(url);
//     }

//     sendMessageToContentScript({action: 'changeStopStatus'}, function() {
//         console.log('stop status has been changed');
//     });

//     sendMessageToContentScript({action: 'refresh'}, function() {
//         console.log('refresh current page');
//     })
// })

Promise.all([getCSPFromHeaders(), getCSPFromDOM()]).then(values => {
    let directives = values[0] || values[1];
    console.log('directives: ', directives);
    processCSP(directives);
    displayCSP(directives);
});

function processCSP(directives) {
    let directivesAry = directives.split(';');
    directivesAry.map(directive => {
        if (directive != '') {
            let cutIndex = directive.indexOf(' ');
            let name = directive.substring(0, cutIndex);
            let value = directive.substring(cutIndex + 1);
            let directiveArray = value.split(' ');
            directiveMap.set(name, directiveArray);
        }
    });
    console.log('map: ', directiveMap);
}

function displayCSP(csp) {
    let directivesAry = csp.split(';');
    directivesAry.map(each => {
        if (each !== '') {
            addRowIntoTable(each);
        }
    })
}

function addRowIntoTable(directive) {
    let cutIndex = directive.indexOf(' ');
    let name = directive.substring(0, cutIndex);
    let value = directive.substring(cutIndex + 1);
    let valueAry = value.split(' ');

    let section = document.getElementById('directive_section');

    let mainDiv = document.createElement('div');
    mainDiv.setAttribute('class', 'card card-1');

    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'card-header');
    newDiv.setAttribute('id', 'heading_' + name);
    let h2 = document.createElement('h2');
    h2.setAttribute('class', 'mb-0');
    newDiv.appendChild(h2);
    let newButton = document.createElement('button');
    newButton.setAttribute('class', 'btn btn-link collapsed');
    newButton.setAttribute('type', 'button');
    newButton.setAttribute('data-toggle', 'collapse');
    newButton.setAttribute('data-target', '#' + name);
    newButton.setAttribute('aria-expanded', 'false');
    newButton.setAttribute('aria-controls', name);
    newButton.innerHTML = name;
    h2.appendChild(newButton);
    mainDiv.appendChild(newDiv);

    let valueDiv = document.createElement('div');
    valueDiv.setAttribute('id', name);
    valueDiv.setAttribute('class', 'collapse');
    valueDiv.setAttribute('aria-labelledby', 'heading_' + name);
    valueDiv.setAttribute('data-parent', '#directive_section');
    let bodyDiv = document.createElement('div');
    bodyDiv.setAttribute('class', 'card-body');
    valueAry.map(each => {
        let input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', name);
        input.value = each;
        input.onchange = (event) => {
            let valueArray = directiveMap.get(name);
            if (!input.checked) {
                let index = valueArray.indexOf(each);
                if (index > -1) {
                    valueArray.splice(index, 1);
                }
            } else {
                valueArray.push(each);
            }
            console.log('after change: ', directiveMap);
        }
        input.setAttribute('checked', true);
        
        let label = document.createElement('label');
        label.appendChild(document.createTextNode(each));

        let br = document.createElement('br');
        bodyDiv.appendChild(input);
        bodyDiv.appendChild(label);
        bodyDiv.appendChild(br);
    })
    valueDiv.appendChild(bodyDiv);
    mainDiv.appendChild(valueDiv);

    section.appendChild(mainDiv);
}

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    bg.modifyCSP(url, toString(directiveMap));
})

function toString(map) {
    let res = "";
    directiveMap.forEach((value, key, map) => {
        console.log('key is: ', key, ' and value is: ', value);
        res += key;
        value.map(each => {
            res += " " + each;
        });
        res += ";";
    });
    return res;
}