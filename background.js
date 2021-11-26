chrome.runtime.onMessage.addListener(function (message, _sender, _sendResponse) {
        console.log('message received from background')
        switch (message.type) {
            case 'acceptHiveTransaction':
                acceptHiveTransaction()
                break
        }
    }
);

function acceptHiveTransaction() {
    console.log('accepting hive transaction...')
    chrome.windows.getAll({populate: true}, function (windows) {
        console.log(windows);
        windows.forEach(function (window) {
            if (window.type === 'popup') {
                window.tabs.forEach(function (tab) {
                    if (tab.title === 'Hive Keychain') {
                        console.log(tab);
                        console.log('attaching chrome debugger')
                        chrome.debugger.attach({
                            tabId: tab.id
                        }, '1.0', function () {
                            console.log('sending command')
                            chrome.debugger.sendCommand({
                                tabId: tab.id
                            }, "Runtime.evaluate", {
                                expression: "document.getElementById('cancel').click();"
                            }, function (response) {
                                console.log(response);
                            });
                        });

                    }
                });
            }
        });
    });
}
