document.addEventListener("DOMContentLoaded", function(_) {
    getisEnabled(isEnabled => {
        document.getElementById("splds-main-button").innerText = isEnabled ? 'DISABLE' : 'ENABLE'
    });
});

document.getElementById("splds-main-button").addEventListener("click", () => {
    getisEnabled(isEnabled => {
        getTab(function(tab) {
            if (isEnabled) {
                // stop
                chrome.tabs.sendMessage(tab.id, { type: 'stop' });
                setisEnabled(false);
            } else {
                // start
                if (!tab.url.startsWith('https://www.cardauctionz.com/market')) {
                    changeStatus('fratm ma non stai su cardauctionz.com/market', 'red')
                    return;
                }

                chrome.tabs.sendMessage(tab.id, { type: 'start' });
                setisEnabled(true);
                //closePopup();

            }
        });
    })
});

function getisEnabled(callback) {
    chrome.storage.local.get({ "isEnabled": false }, function(storage) {
        callback(storage["isEnabled"])
    });
}

function setisEnabled(value) {
    document.getElementById("splds-main-button").innerText = value ? 'DISABLE' : 'ENABLE'
    chrome.storage.local.set({ "isEnabled": value }, function() {})
}

function getAuthCookie(callback) {
    chrome.storage.local.get({ "splds-auth-cookie": "" }, function(storage) {
        callback(storage["splds-auth-cookie"])
    });
}

function setAuthCookie(value) {
    chrome.storage.local.set({ "splds-auth-cookie": value }, function() {})
}

function getTab(callback) {
    return chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length <= 0) {
            changeStatus('non ci sta il tab fratm', 'red')
            return;
        }
        callback(tabs[0]);
    });
}

function closePopup() {
    window.close();
}

function changeStatus(text, color) {
    document.getElementById('splds-status').innerText = text;
    document.getElementById('splds-status').style.color = color;
}