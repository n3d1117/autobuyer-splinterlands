chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('received message')
    switch (message.type) {
        case 'start':
            //sendResponse(text);
            setInterval(function() {
                console.log('repeating...')
                console.log(document.body)
            }, 5000);
            break;
    }
});