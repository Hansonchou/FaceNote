console.log('execute init-facenote.js')

if (!facenoteButtonHandler.hasFaceNoteButton()) {
  facenoteButtonHandler.insertFnButton();
}

chrome.runtime.sendMessage({
    greeting: "get_access_token_silently"
  },
  function (access_token) {
    if (access_token) {
      noteRequester.access_token = access_token;
      noteRequester.sendNoteRequest('read', facenoteButtonHandler.updateNoteContent);
    }
  }
);
