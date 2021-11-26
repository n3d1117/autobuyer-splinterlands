chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('message received')
    switch (message.type) {
        case 'start':
            injectDiv()
            break
        case 'stop':
            remove()
            break
    }
});

document.addEventListener("DOMContentLoaded", function (_) {
    getisEnabled(isEnabled => {
        if (isEnabled && location.href.startsWith('https://www.cardauctionz.com/market')) {
            injectDiv()
        }
    });
});

function getisEnabled(callback) {
    chrome.storage.local.get({"isEnabled": false}, function (storage) {
        callback(storage["isEnabled"]);
    });
}

function remove() {
    removeDiv()
}

function injectDiv() {
    if (document.getElementById('splds-autobuyer') === null) {
        getAllCards(function (response) {
            response.json().then(response => {
                const main = document.querySelector('main');
                const outerDiv = document.createElement("div");
                outerDiv.id = 'splds-autobuyer'
                outerDiv.style = `
                width: 100%;
                border-top-width: 30px;
                border-color: transparent;
                `
                main.insertBefore(outerDiv, main.firstChild);

                const title = document.createElement("h1");
                title.innerText = "Autobuyer";
                title.classList.add('text-4xl', 'font-extrabold', 'tracking-tight', 'text-gray-900');
                title.style = "margin-bottom: 24px;";
                outerDiv.appendChild(title);

                const form = document.createElement('div');

                let selectCardsElement = ""
                response.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                }).forEach(function (card) {
                    selectCardsElement += "<option value='" + card.id + "'>" + card.name + "</option>"
                })

                form.innerHTML = `
                <form class="mt-4" style="margin-bottom: 16px">
                    <input type="text" id="splsd-autobuyer-auth-username" class="focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="username">
                    <div class="sm:flex sm:max-w-md mt-4">
                        <select name="cards" id="splsd-autobuyer-card" class="focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md">
                            <option value="" disabled selected>Scegli una carta</option>
                            ${selectCardsElement}
                        </select>
                        <select name="editions" id="splsd-autobuyer-edition" class="sm:ml-3 focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md">
                            <option value="" disabled selected>Scegli una edizione</option>
                            <option value="0">Alpha</option>
                            <option value="1">Beta</option>
                            <option value="2">Promo</option>
                            <option value="3">Reward</option>
                            <option value="4">Untamed</option>
                            <option value="5">Dice</option>
                            <option value="6">Gladius</option>
                        </select>
                        <input type="text" id="splsd-autobuyer-price-input" class="sm:ml-3 focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md" placeholder="max buy price (USD)">
                        <div class="sm:ml-6 flex items-center">
                            <input id="splsd-autobuyer-gold-checkbox" type="checkbox" class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500" value="gold">
                            <label for="splsd-autobuyer-gold-checkbox" class="ml-2 text-sm text-gray-600">Gold</label>
                        </div>
                    </div>
                    <div class="sm:flex sm:max-w-md mt-4">
                        <div class="mt-3 rounded-md sm:mt-0 sm:flex-shrink-0">
                            <button type="button" id="splsd-gogogo" onclick="return false;" class="w-full bg-indigo-500 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-600">
                            Gogogo
                            </button>
                        </div>
                        <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                            <button type="button" id="splsd-ferma" onclick="return false;" style="background-color: #F43F5E" class="w-full border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white">
                            Ferma
                            </button>
                        </div>
                    </div>
                </form>
                `.trim();
                outerDiv.appendChild(form.firstChild);

                const logDiv = document.createElement("div");
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

                document.getElementById("splsd-autobuyer-card").addEventListener("change", () => {
                    const selectedCard = response.find(card => card.id == document.getElementById("splsd-autobuyer-card").value)
                    const editions = selectedCard.editions.split(",")
                    Array.from(document.getElementById("splsd-autobuyer-edition").children).forEach(option => {
                        option.disabled = !editions.includes(option.value);
                    });
                });

                activate();
            });
        });
    } else {
        activate()
    }
}

function activate() {
    setSearchInput();
    //loadAll();
    log('autobuyer attivato');
    log('PRIMA DI INIZIARE ASSICURATI DI AVERE HIVE SBLOCCATO E CARRELLO VUOTO');
}

function removeDiv() {
    if (document.getElementById('splds-autobuyer') != null)
        document.getElementById('splds-autobuyer').remove()
}

let isRunning = false;
const intervalId = '';

/*
function disableAllFilters() {
    if (document.getElementById("filter-edition-4") != null)
        return;
    document.getElementById("headlessui-disclosure-button-4").click();
    document.getElementById("filter-edition-4").click();
}*/

function gogogo() {
    if (!isRunning) {
        let username = document.getElementById('splsd-autobuyer-auth-username').value

        let cardId = document.getElementById('splsd-autobuyer-card').value
        let cardName = document.getElementById('splsd-autobuyer-card').options[document.getElementById('splsd-autobuyer-card').selectedIndex].text
        let cardEditionId = document.getElementById('splsd-autobuyer-edition').value
        let cardEdition = document.getElementById('splsd-autobuyer-edition').options[document.getElementById('splsd-autobuyer-edition').selectedIndex].text
        let buyPrice = document.getElementById('splsd-autobuyer-price-input').value
        let gold = document.getElementById('splsd-autobuyer-gold-checkbox').checked

        // todo validate

        log('autobuyer partito con user ' + username + ', carta ' + cardName + ' (' + cardId + '), edizione ' + cardEdition + ' (' + cardEditionId + '), min buy ' + buyPrice + ', gold=' + gold, 'blue');
        isRunning = true;

        getCookie(username, function (response) {
            response.json().then(r => {
                let cookie = r.data

                function begin() {
                    if (!isRunning) {
                        return;
                    }
                    log('inizio ricerca...');

                    function proceedToCheckout() {
                        closeAnyModal();
                        setTimeout(() => {
                            openShoppingCart();
                            setTimeout(() => {
                                clickCheckout();
                                setTimeout(() => {
                                    acceptHiveTransaction();
                                }, 500)
                            }, 500);
                        }, 500);
                    }

                    function addToCart() {
                        findCards(cardId, gold, cardEditionId, function (cards) {
                            console.log(cards)
                            cards.sort(function (a, b) {
                                return parseFloat(a.buy_price) - parseFloat(b.buy_price);
                            });

                            waitForTag('table').then((table) => {
                                for (const card of cards) {
                                    const row = Array.from(table.rows).filter(value => {
                                        return value.firstChild.textContent == card.uid
                                    })[0];
                                    if (row) {
                                        row.children[7].firstChild.click();
                                        setTimeout(proceedToCheckout, 500);
                                        break;
                                    }
                                }
                            });
                        });
                    }

                    search(cardName)
                    setTimeout(() => {
                        let cardFound = false;
                        Array.from(document.getElementsByClassName("object-fill")).forEach(async function (element) {
                            if (element.getAttribute("alt") === cardName && element.decoding === 'async' && !cardFound) {
                                console.log(element.getAttribute("src"))
                                if (element.getAttribute("src").includes(cardEdition.toLowerCase())) {
                                    if (gold && element.getAttribute("src").includes('_gold')) {
                                        log('gold card found!');
                                        element.parentElement.parentElement.click();
                                        cardFound = true;
                                        setTimeout(addToCart, 1000);
                                    } else if (!gold && !element.getAttribute("src").includes('_gold')) {
                                        log('card found!');
                                        element.parentElement.parentElement.click();
                                        cardFound = true;
                                        setTimeout(addToCart, 1000);
                                    }
                                } else {
                                    log('non c\'è l\'edizione nell\'url immagine??');
                                }
                            }
                        })
                    }, 500)

                    // trova carta
                    /*findCards(cardId, gold, function (card) {
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
                    })*/
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

function openShoppingCart() {
    if (!isRunning) {
        return;
    }
    log('apro carrello')
    document.querySelector("#__next > nav > div > div > div:nth-of-type(2) > div > button:nth-of-type(2)").click()
}

function closeAnyModal() {
    if (!isRunning) {
        return;
    }
    log('chiudo finestra')
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

function search(name) {
    document.getElementById("search").value = name;
    document.getElementById("search").dispatchEvent(new Event('change', {'bubbles': true}));
    document.getElementById("hiddenSearchInput").click();
}

function setSearchInput() {
    log('setting hidden text input...')
    const input = document.getElementById("search");
    const form = input.parentElement.parentElement;
    const hiddenInput = document.createElement('input');
    hiddenInput.id = 'hiddenSearchInput';
    hiddenInput.type = 'submit';
    hiddenInput.value = '';
    form.appendChild(hiddenInput)
}

function getCookie(username, callback) {
    if (!isRunning) {
        return;
    }
    log('prendo cookie per username ' + username + '...')
    fetch("https://splds-cookie.herokuapp.com/cookie/?username=" + username).then(response => callback(response));
}

function getAllCards(callback) {
    fetch('https://api2.splinterlands.com/cards/get_details').then(response => callback(response));
}

function findCards(id, gold, edition, callback) {
    log('cerco carta ' + id + '...')
    fetch("https://api2.splinterlands.com/market/for_sale_by_card?card_detail_id=" + id + "&edition=" + edition + "&gold=" + gold, {
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
            log('ci sono ' + data.length + ' carte')
            callback(data)
        });
    });
}

function waitForTag(tag) {
    return new Promise(resolve => {
        if (document.getElementsByTagName(tag)[0]) {
            return resolve(document.getElementsByTagName(tag)[0]);
        }

        const observer = new MutationObserver(mutations => {
            if (document.getElementsByTagName(tag)[0]) {
                resolve(document.getElementsByTagName(tag)[0]);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
