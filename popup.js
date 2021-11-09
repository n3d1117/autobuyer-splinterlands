document.getElementById("splds-start").addEventListener("click", () => {
    getTab(function(tab) {

        // todo check params validity
        cardId = document.getElementById('splds-card-id').value;
        buyPrice = document.getElementById('splds-buy-price').value;

        chrome.tabs.sendMessage(tab.id, { type: 'start' });

        closePopup();
    });
});

document.getElementById("splds-stop").addEventListener("click", () => {
    getTab(function(tab) {
        chrome.tabs.sendMessage(tab.id, { type: 'stop' });
        closePopup();
    });
});

function getTab(callback) {
    return chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        console.log('sono qui')
        if (tabs.length <= 0) {
            changeStatus('non ci sta il tab fratm', 'red')
        }
        console.log('sono qui 2')
        if (!tabs[0].url.startsWith('https://www.cardauctionz.com/')) {
            changeStatus('fratm ma non stai su cardauctionz.com', 'red')
        }
        console.log('sono qui 3')
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