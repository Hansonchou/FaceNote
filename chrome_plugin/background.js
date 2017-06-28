console.log('execute background');
console.log(chrome.app.getDetails().version);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.get(tabId, function (tab) {
            if (isFBProfileUrl_(tab.url)) {
                chrome.tabs.executeScript(tabId, {
                    file: "init-facenote.js",
                    runAt: "document_end"
                });
            }
        });
    }
});

// Listen to content page for access_token request
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.greeting) {
      case 'get_access_token_interactively':
        getToken(true, sendResponse);
        return true;
        break;
      case 'get_access_token_silently':
        getToken(false, sendResponse);
        return true;
        break;
      case 'remove_invalid_access_token_and_try_again':
        removeTokenAndTryAgain(sendResponse);
        return true;
        break;
    };
  }
);

function removeTokenAndTryAgain(sendResponse) {
  chrome.identity.getAuthToken({
      'interactive': false
  }, function(access_token) {
        chrome.identity.removeCachedAuthToken(
      { 'token': access_token },
      function() {
        chrome.identity.getAuthToken({
            'interactive': true
        }, function (access_token) {
            sendResponse(access_token);
        });
      });
  })
}

function getToken(isInteractive, sendResponse) {
    chrome.identity.getAuthToken({
        'interactive': isInteractive
    }, function (access_token) {
        sendResponse(access_token);
    });
}

let isFBProfileUrl_ = function(url) {
    var pattern = /^https?:\/\/www.facebook.com\/[^\/]+$/i;
    return pattern.test(url);
}
