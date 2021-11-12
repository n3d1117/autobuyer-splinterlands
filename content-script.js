chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('message received')
    switch (message.type) {
        case 'start':
            setup()
            break
        case 'stop':
            remove()
            break
    }
});

document.addEventListener("DOMContentLoaded", function (_) {
    getisEnabled(isEnabled => {
        if (isEnabled) {
            setup()
        }
    });
});

function getisEnabled(callback) {
    chrome.storage.local.get({ "isEnabled": false }, function (storage) {
        callback(storage["isEnabled"]);
    });
}

function setup() {
    injectDiv()
    log('autobuyer attivato');
    log('PRIMA DI INIZIARE ASSICURATI DI AVERE HIVE SBLOCCATO E CARRELLO VUOTO');
}

function remove() {
    removeDiv()
}

function injectDiv() {
    if (document.getElementById('splds-autobuyer') === null) {
        var main = document.querySelector('main');
        var outerDiv = document.createElement("div");
        outerDiv.id = 'splds-autobuyer'
        outerDiv.style = `
        width: 100%;
        border-top-width: 20px;
        border-color: transparent;
        `
        main.insertBefore(outerDiv, main.firstChild);

        var title = document.createElement("h1");
        title.innerText = "Autobuyer";
        title.classList.add('text-4xl', 'font-extrabold', 'tracking-tight', 'text-gray-900');
        title.style = "margin-bottom: 24px;";
        outerDiv.appendChild(title);

        var form = document.createElement('div');
        form.innerHTML = `
        <form class="mt-4 sm:flex sm:max-w-md" style="margin-bottom: 16px">
            <input type="text" id="splsd-autobuyer-auth-username" class="focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="username">
            <input type="text" id="splsd-autobuyer-auth-cookie" class="sm:ml-3 focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="cookie">
            <input type="text" id="splsd-autobuyer-cardid-input" class="sm:ml-3 focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="card id">
            <input type="text" id="splsd-autobuyer-price-input" class="sm:ml-3 focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="max buy price">
            <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button type="button" id="splsd-gogogo" onclick="return false;" class="w-full bg-indigo-500 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-600">
                Gogogo
                </button>
            </div>
            <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button type="button" id="splsd-ferma" onclick="return false;" style="background-color: #F43F5E" class="w-full border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white">
                Ferma
                </button>
            </div>
        </form>
        `.trim();
        outerDiv.appendChild(form.firstChild);

        var logDiv = document.createElement("div");
        logDiv.id = 'splds-autobuyer-log'
        logDiv.style = "height: 150px";
        logDiv.classList.add('z-10', 'relative', 'bg-gray-200', 'shadow', 'rounded-lg', 'p-2', 'overflow-y-auto');
        outerDiv.appendChild(logDiv);

        document.getElementById("splsd-gogogo").addEventListener("click", () => {
            gogogo();
        });
        document.getElementById("splsd-ferma").addEventListener("click", () => {
            ferma();
        });
    }
}

function removeDiv() {
    if (document.getElementById('splds-autobuyer') != null)
        document.getElementById('splds-autobuyer').remove()
}

var isRunning = false;
var intervalId = '';

function gogogo() {
    if (!isRunning) {
        username = document.getElementById('splsd-autobuyer-auth-username').value;
        cookie = document.getElementById('splsd-autobuyer-auth-cookie').value;
        cardId = document.getElementById('splsd-autobuyer-cardid-input').value;
        buyPrice = document.getElementById('splsd-autobuyer-price-input').value;

        // todo validate

        log('autobuyer partito con user ' + username + ' cookie ' + cookie + ' carta ' + cardId + ' e min buy ' + buyPrice, 'blue');
        isRunning = true;

        function begin() {
            log('itero...');
            
            // TODO: trova carta e aggiungi al carrello
            updateCart(username, cookie, function(response) {
                response.json().then(data => {
                    log(JSON.stringify(data))
                    reloadCart()
                    openShoppingCart()
                    setTimeout(function () {
                        closeShoppingCart()
                    }, 1000);
                })
            })

            /*reloadCart()
            openShoppingCart()
            setTimeout(function () {
                clickCheckout()
                acceptHiveTransaction()
                //closeShoppingCart()
            }, 1000);*/

            // acceptHiveTransaction(); dopo 1s (cambia pulsante da premere in background.js)
        }

        begin()
        /*intervalId = setInterval(function () {
            begin()
        }, 6000);*/
    }
}

function ferma() {
    if (isRunning) {
        clearInterval(intervalId);
        log('autobuyer fermato', 'blue');
        isRunning = false;
    }
}

function log(text, color = 'gray') {
    var container = document.getElementById('splds-autobuyer-log');
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1
    var p = document.createElement('p');
    p.style.color = color;
    p.innerText = '[' + new Date().toLocaleString() + '] ' + text;
    p.classList.add('text-sm', 'text-gray-600');
    container.appendChild(p);
    if (isScrolledToBottom)
        container.scrollTop = container.scrollHeight - container.clientHeight
}

function reloadCart() {
    window.dispatchEvent(new FocusEvent('focus', {
        view: window,
        bubbles: true,
        cancelable: false
    }))
}

function openShoppingCart() {
    log('opening shopping cart')
    document.querySelector("#__next > nav > div > div > div:nth-of-type(2) > div > button:nth-of-type(2)").click()
}

function closeShoppingCart() {
    log('closing shopping cart')
    document.elementFromPoint(10, 10).click()
}

function clickCheckout() {
    log('clicking checkout')
    document.querySelector("#headlessui-portal-root > div > div > div > div > div > div > div > div:nth-child(5) > a").click();
}

function acceptHiveTransaction() {
    log('accepting hive transaction from background worker...')
    chrome.runtime.sendMessage({
        type: "acceptHiveTransaction"
    });
}

function updateCart(username, cookie, callback) {
    fetch("https://www.cardauctionz.com/api/updateCart", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "cookie": "card_auctionz_local=" + cookie,
            "Referer": "https://www.cardauctionz.com/market",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"player\":\"" + username + "\",\"cart\":[{\"player\":\"wukuida1\",\"uid\":\"C4-168-D7S975RJMO\",\"card_detail_id\":168,\"xp\":72,\"gold\":false,\"edition\":4,\"market_id\":\"f452477ddd071b9471eab15be73ae280fe62b06e-0\",\"buy_price\":\"136.070\",\"market_listing_type\":\"SELL\",\"market_listing_status\":0,\"last_used_block\":40384336,\"last_used_player\":\"cernoockocz\",\"last_used_date\":\"2020-01-30T15:23:45.000Z\",\"last_transferred_block\":59106149,\"last_transferred_date\":\"2021-11-12T08:39:12.000Z\",\"alpha_xp\":0,\"delegated_to\":null,\"delegation_tx\":null,\"skin\":null,\"delegated_to_display_name\":null,\"display_name\":null,\"lock_days\":null,\"unlock_date\":null,\"details\":{\"id\":168,\"name\":\"Feasting Seaweed\",\"color\":\"Blue\",\"type\":\"Monster\",\"sub_type\":null,\"rarity\":1,\"drop_rate\":0,\"stats\":{\"mana\":[4,4,4,4,4,4,4,4,4,4],\"attack\":[2,2,3,3,3,3,3,3,3,4],\"ranged\":[0,0,0,0,0,0,0,0,0,0],\"magic\":[0,0,0,0,0,0,0,0,0,0],\"armor\":[0,0,0,0,0,0,0,0,0,0],\"health\":[2,3,3,3,4,3,3,4,4,4],\"speed\":[1,1,1,2,2,2,3,3,4,4],\"abilities\":[[\"Opportunity\"],[],[],[],[],[\"Scavenger\"],[],[],[],[]]},\"is_starter\":false,\"editions\":\"4\",\"created_block_num\":38630039,\"last_update_tx\":\"d80c0713c3a042418a231c9ef241248f6bff6abb\",\"total_printed\":206308,\"is_promo\":false,\"tier\":null,\"distribution\":[{\"card_detail_id\":168,\"gold\":false,\"edition\":4,\"num_cards\":\"33551\",\"total_xp\":\"191375\",\"num_burned\":\"2318\",\"total_burned_xp\":\"7688\"},{\"card_detail_id\":168,\"gold\":true,\"edition\":4,\"num_cards\":\"3010\",\"total_xp\":\"6721\",\"num_burned\":\"327\",\"total_burned_xp\":\"524\"}]}}]}",
        "method": "POST"
    }).then(response => callback(response));
}