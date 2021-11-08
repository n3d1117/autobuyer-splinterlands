document.getElementById("splds-start").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

        if (tabs.length <= 0) {
            changeStatus('errore #1', 'red')
            return
        }

        const tab = tabs[0];
        if (!tab.url.startsWith('https://www.cardauctionz.com/')) {
            console.log(tab.url)
            changeStatus('fratm ma non stai su cardauctionz.com', 'red')
            return
        }

        // todo check params validity
        cardId = document.getElementById('splds-card-id').value;
        buyPrice = document.getElementById('splds-buy-price').value;

        chrome.tabs.sendMessage(tab.id, { type: 'start' }, function(response) {
            console.log(response);
        });

        // Close popup!
        window.close();
    });
});

/*function onGogogoClick() {

        setTimeout(function() {
            chrome.windows.getAll({ populate: true }, function(windows) {
                windows.forEach(function(window) {
                    if (window.type === 'popup') {
                        window.tabs.forEach(function(tab) {
                            if (tab.title === 'Hive Keychain') {
                                chrome.debugger.attach({
                                    tabId: tab.id
                                }, '1.0', function() {
                                    chrome.debugger.sendCommand({
                                        tabId: tab.id
                                    }, "Runtime.evaluate", {
                                        expression: "document.getElementById('no-unlock').click();"
                                    }, function(response) {
                                        console.log(response);
                                    });
                                });

                            }
                        });
                    }
                });
            });
        }, 2000);

    })
}*/

function changeStatus(text, color) {
    document.getElementById('splds-status').innerText = text;
    document.getElementById('splds-status').style.color = color;
}