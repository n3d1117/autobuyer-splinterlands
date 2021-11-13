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
    chrome.storage.local.get({"isEnabled": false}, function (storage) {
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
        const main = document.querySelector('main');
        const outerDiv = document.createElement("div");
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
        logDiv.style = "height: 250px; margin-bottom: 16px";
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

let isRunning = false;
const intervalId = '';

function gogogo() {
    if (!isRunning) {
        let username = document.getElementById('splsd-autobuyer-auth-username').value
        let cardId = document.getElementById('splsd-autobuyer-cardid-input').value
        let buyPrice = document.getElementById('splsd-autobuyer-price-input').value

        // todo validate

        log('autobuyer partito con user ' + username + ', carta ' + cardId + ' e min buy ' + buyPrice, 'blue');
        isRunning = true;

        getCookie(username, function (response) {
            response.json().then(r => {
                let cookie = r.data
                function begin() {
                    if (!isRunning) {
                        return;
                    }
                    log('inizio ricerca...');

                    // trova carta
                    findCard(cardId, function (card) {
                        updateCart(username, cookie, JSON.stringify(card), function (response2) {
                            response2.json().then(_ => {
                                setTimeout(function () {
                                    reloadCart()
                                    openShoppingCart()
                                    setTimeout(() => {
                                        clickCheckout();
                                        setTimeout(() => {
                                            acceptHiveTransaction();
                                        }, 500)
                                    }, 500)
                                }, 500);
                            })
                        })
                    })
                }

                begin();
                /*intervalId = setInterval(function() {
                    begin()
                }, 6000);*/

            })
        })
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
    const container = document.getElementById('splds-autobuyer-log');
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1
    const p = document.createElement('p');
    p.style.color = color;
    p.innerText = '[' + new Date().toLocaleString() + '] ' + text;
    p.classList.add('text-sm', 'text-gray-600');
    container.appendChild(p);
    if (isScrolledToBottom)
        container.scrollTop = container.scrollHeight - container.clientHeight
}

function reloadCart() {
    if (!isRunning) {
        return;
    }
    window.dispatchEvent(new FocusEvent('focus', {
        view: window,
        bubbles: true,
        cancelable: false
    }))
}

function openShoppingCart() {
    if (!isRunning) {
        return;
    }
    log('apro carrello')
    document.querySelector("#__next > nav > div > div > div:nth-of-type(2) > div > button:nth-of-type(2)").click()
}

function closeShoppingCart() {
    if (!isRunning) {
        return;
    }
    log('chiudo carrello')
    document.elementFromPoint(10, 10).click()
}

function clickCheckout() {
    if (!isRunning) {
        return;
    }
    log('clicco checkout')
    document.querySelector("#headlessui-portal-root > div > div > div > div > div > div > div > div:nth-child(5) > a").click();
}

function acceptHiveTransaction() {
    if (!isRunning) {
        return;
    }
    log('accepting hive transaction from background worker...')
    chrome.runtime.sendMessage({
        type: "acceptHiveTransaction"
    });
}

function getCookie(username, callback) {
    if (!isRunning) {
        return;
    }
    log('prendo cookie per username ' + username + '...')
    fetch("https://splds-cookie.herokuapp.com/cookie/?username=" + username).then(response => callback(response));
}

function findCard(id, callback) {
    log('cerco carta ' + id + '...')
    fetch("https://cache-api.splinterlands.com/market/for_sale_by_card?card_detail_id=" + id + "&edition=3&gold=false", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1"
        },
        "referrer": "https://www.cardauctionz.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    }).then(response => {
        response.json().then(data => {

            // TODO: logic to select a card in the market
            let card = data[0]
            log('uid: ' + card.uid)

            fetch("https://api2.splinterlands.com/cards/find?ids=" + card.uid, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1"
                },
                "referrer": "https://www.cardauctionz.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "omit"
            }).then(response2 => {
                response2.json().then(data2 => {
                    callback(data2)
                });
            });
        });
    });
}

function updateCart(username, cookie, body, callback) {
    if (!isRunning) {
        return;
    }
    log('aggiorno carrello...')
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
        "body": "{\"player\":\"" + username + "\",\"cart\":" + body + "}",
        "method": "POST"
    }).then(response => callback(response));
}

function clearCart(username, cookie, callback) {
    if (!isRunning) {
        return;
    }
    log('pulisco carrello...')
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
        "body": "{\"player\":\"" + username + "\",\"cart\":[]}",
        "method": "POST"
    }).then(response => callback(response));
}
