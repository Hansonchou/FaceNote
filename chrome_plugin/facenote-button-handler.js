console.log('inject facenote-button-handler');

class FacenoteButtonHandler {
	constructor() {
    // Id of my FaceNote button.
    this.fnId = 'facenoteid';
		// Class names of profile buttons for locating where to insert FaceNote Button.
		this.profileButtonClassNames = '_51xa _2yfv _3y89';
    // Put classes to have FaceNote button style consistent with neighbors.
    this.facenoteClasses = '_42ft _4jy0 _4jy4 _517h _51sy';
		// Id of overlaying note div.
		this.overlayingNoteDivId = 'overlayingNoteDiv';
		// Id of note content text.
		this.noteContentid = 'noteContent';
		// Note content
		this.note = 'Loading...';
	}
	
	hasFaceNoteButton() {
		return document.getElementById(this.fnId);
	}
	
	insertFnButton() {
		console.log('insertFnButton');
		// TODO: find a better way to location profile buttons.
    let profileButtons = document.getElementsByClassName(this.profileButtonClassNames)[0];
    if (profileButtons != null) { // Only insert button if we can locate the profile buttons.
			let fnButton = this.createFaceNoteButton_();
			let overlayingNoteDiv = this.createOverlayingNoteDiv_();
			profileButtons.appendChild(overlayingNoteDiv);
			profileButtons.insertBefore(fnButton, profileButtons.childNodes[0]);
			fnButton.onclick = this.fnOnclickFunction_(overlayingNoteDiv);
    }
	}
	
	updateNoteContent(noteContent) {
		facenoteButtonHandler.note = noteContent;
		console.log(facenoteButtonHandler.note);
		facenoteButtonHandler.showDisplayNoteMode_(
			document.getElementById(facenoteButtonHandler.overlayingNoteDivId));
	}
	
	createFaceNoteButton_() {
		let fnButton = document.createElement('p');
		// TODO: add the pen img back.
//		let img = document.createElement('i');
//		img.setAttribute('class', this.noteImgClassNames);
//		fnButton.appendChild(img);
		fnButton.appendChild(document.createTextNode(' Note'));
		fnButton.setAttribute('id', this.fnId);
		fnButton.setAttribute('class', this.facenoteClasses);
		return fnButton;
	}
	
	createOverlayingNoteDiv_() {
		console.log("createOverlayingNoteDiv_");
		let overlayingNoteDiv = document.createElement('div');
		overlayingNoteDiv.id = this.overlayingNoteDivId;
		overlayingNoteDiv.style.visibility = 'hidden';
		overlayingNoteDiv.style.position = 'absolute';
		overlayingNoteDiv.style.top = '81px';
		overlayingNoteDiv.style.minHeight = '150px';
		overlayingNoteDiv.style.width = '220px';
		overlayingNoteDiv.style.zIndex = 99;
		overlayingNoteDiv.style.background = 'white';
		overlayingNoteDiv.style.border = '1px solid';
		this.showDisplayNoteMode_(overlayingNoteDiv);
		return overlayingNoteDiv;
	}
	
	showDisplayNoteMode_(overlayingNoteDiv) {
		overlayingNoteDiv.innerHTML = '';
		// TODO: can't display multiple lines now.
		let noteContent = document.createElement('div');
		noteContent.id = this.noteContentid;
		noteContent.innerHTML = this.note.split('\n').join('<br>');
		noteContent.style.width = '100%';
		noteContent.style.height = '124px';
		noteContent.style.boxSizing = 'border-box';
		noteContent.style.display = 'block';
		noteContent.style.padding = '3px';
		noteContent.style.whiteSpace = 'normal';
		noteContent.style.textAlign = 'left';
		overlayingNoteDiv.appendChild(noteContent);
		
		let editButton = this.getActionButtonDiv_();
		editButton.textContent = 'Edit Note';
		editButton.onclick = this.showUpdateNoteMode_;
		overlayingNoteDiv.appendChild(editButton);
	}
	
	showUpdateNoteMode_() {
		let overlayingNoteDiv = document.getElementById(facenoteButtonHandler.overlayingNoteDivId);
		overlayingNoteDiv.innerHTML = '';
		let editingBlock = document.createElement('textarea');
		editingBlock.style.width = '100%';
		editingBlock.style.height = '124px';
		editingBlock.style.boxSizing = 'border-box';
		editingBlock.value = facenoteButtonHandler.note === "no note yet"? "" : facenoteButtonHandler.note;
		overlayingNoteDiv.appendChild(editingBlock);

		let saveButton = facenoteButtonHandler.getActionButtonDiv_();
		saveButton.textContent = 'Save!';
		saveButton.onclick = function() {
			facenoteButtonHandler.note = 'Updating...';
			noteRequester.sendNoteRequest(
				'update', facenoteButtonHandler.updateNoteContent, editingBlock.value);
			facenoteButtonHandler.showDisplayNoteMode_(overlayingNoteDiv);
		}
		overlayingNoteDiv.appendChild(saveButton);
	}

	fnOnclickFunction_(overlayingNoteDiv) {
    return function() {
			if (noteRequester.access_token === null) {
				// First time user. Pop-up welcome message and request permission.
				alert('Looks like you are first time user to FaceNote. Welcome!!! In order to tie the notes to your account, we need to know who you are on Google domain. The request is only asking your identy like email.')
				chrome.runtime.sendMessage({
					greeting: "get_access_token_interactively"}, function(access_token) {
					noteRequester.access_token = access_token;
					noteRequester.sendNoteRequest('read', facenoteButtonHandler.updateNoteContent);
				});
			};

			if (overlayingNoteDiv.style.visibility === 'visible') {
				overlayingNoteDiv.style.visibility = 'hidden';
			} else {
				overlayingNoteDiv.style.visibility = 'visible';
			}
    };
	}
	
	getActionButtonDiv_() {
		let actionButtonDiv = document.createElement('div');
		actionButtonDiv.value = 'Edit Note';
		actionButtonDiv.style.backgroundColor = '#4267b2';
		actionButtonDiv.style.color = '#fff';
		actionButtonDiv.style.padding = '0 16px';
		actionButtonDiv.style.position = 'absolute';
		actionButtonDiv.style.width = '100%';
		actionButtonDiv.style.lineHeight = '26px';
		actionButtonDiv.style.bottom = 0;
		actionButtonDiv.style.textAlign = 'center';
		actionButtonDiv.style.boxSizing = 'border-box';
		return actionButtonDiv;
	}
}

const facenoteButtonHandler = new FacenoteButtonHandler();
