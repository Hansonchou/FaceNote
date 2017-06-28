console.log('inject note-requester');

class NoteRequester {
  constructor() {
    this.access_token = null;
  }

  sendNoteRequest(operation, updateNote, note) {
    const json = this.constructJsonRequest_(this.access_token, operation, note);
    console.log(json);
    const url = 'https://us-central1-facenote-163414.cloudfunctions.net/note';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      if (this.status === 200 && this.response) {
        let responseJSON = JSON.parse(this.response);
        console.log(responseJSON);

        // check if access_code is invalid
        if (responseJSON.error_code === 1) {
          chrome.runtime.sendMessage({
            greeting: "remove_invalid_access_token_and_try_again"
          }, function (access_token) {
            noteRequester.access_token = access_token;
            noteRequester.sendNoteRequest('read', facenoteButtonHandler.updateNoteContent);
          });
          return;
        }

        let note = "no note yet";
        if (responseJSON.note && responseJSON.note.note_content) {
          note = responseJSON.note.note_content;
        }
        updateNote(note);
        //  if (JSON.parse(this.response).note.note_content) {
        //    updateNoteContent(JSON.parse(this.response).note.note_content);
        //    alert("obtained note: " + JSON.parse(this.response).note.note_content);
        //  }
      }
    };
    xhr.send(json);
  }

  constructJsonRequest_(access_token, operation, note) {
    return JSON.stringify({
      operation: operation,
      user: this.getUser_(access_token),
      contact: this.getContact_(),
      note: note
    });
  }

  getUser_(access_token) {
    return {
      fb_id: this.getUserFBId_(),
      access_token: access_token
    }
  }

  getUserFBId_() {
    return /"USER_ID":"(\d+)"/.exec(document.head.innerHTML)[1];
  }

  getContact_() {
    return {
      fb_id: this.getContactId_(),
      name: this.getContactName_()
    }
  }

  getContactId_() {
    return /profile_id&quot;:(\d+),/.exec(document.body.innerHTML)[1];
  }

  getContactName_() {
    return document.getElementById('pageTitle').textContent;
  }
}

const noteRequester = new NoteRequester();
