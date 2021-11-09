intervalId = '';

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('message received')
    switch (message.type) {
        case 'start':
            start()
            break
        case 'stop':
            stop()
            break
    }
});

function start() {

    injectDiv()
    log('starting');

    openShoppingCart();

    setTimeout(function () {
        clickCheckout();

        setTimeout(function () {
            acceptHiveTransaction();

            setTimeout(function () {
                closeShoppingCart();
            }, 2000);

        }, 2000);

    }, 2000);
    /*intervalId = setInterval(function() {
        openShoppingCart()
        setTimeout(function() {
            closeShoppingCart()
        }, 1000)
    }, 5000);*/
}

function injectDiv() {
    if (document.getElementById('splds-autobuyer-log') === null) {
        var main = document.querySelector('main');
        var outerDiv = document.createElement("div");
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
        
        var innerDiv = document.createElement("div");
        innerDiv.id='splds-autobuyer-log'
        innerDiv.style = "max-height: 150px";
        innerDiv.classList.add('z-10', 'relative', 'bg-gray-200', 'shadow', 'rounded-lg', 'p-2', 'overflow-y-auto');
        outerDiv.appendChild(innerDiv);
    }
}

function log(text) {
    var container = document.getElementById('splds-autobuyer-log');
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1
    var p = document.createElement('p');
    p.innerText = '[' + new Date().toLocaleString() + '] ' + text;
    p.classList.add('text-sm', 'text-gray-600');
    container.appendChild(p);
    if (isScrolledToBottom)
        container.scrollTop = container.scrollHeight - container.clientHeight
}

function stop() {
    log('stopping')
    //clearInterval(intervalId);
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