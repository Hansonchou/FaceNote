const dbOperator = require('./db-operator');
const networkHelper = require('./network-helper');
const version = "0.0.1";

/**
    Error Code:
    0 -> ok
    1 -> Unauthorized. Most likely invalid access_token.
    2 -> Unrecognized operation.
    3 -> Internal server error.
*/

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.note = function noteRequest (req, res) {
    console.log("Received noteRequest:" + JSON.stringify(req.body));
    networkHelper.getUserEmail(req.body.user.access_token)
          .then((profile) => {
            let jsonProfile = JSON.parse(profile);
            jsonProfile.fb_id = req.body.user.fb_id;
            console.log('user_fb_id: ' + req.body.user.fb_id);
            conductDbOperation(req.body, jsonProfile, res);
        }, (errCode) => {
            console.log(new Error(errCode));
            console.log(errCode);
            if (errCode == '401') {
                // Unauthorized access to Google API server. Most likely invalid access_token.
                sendBack(res, 1);
            } else {
                sendBack(res, errCode);
            }
        }).catch((err) => {
            console.log(err);
            sendBack(res, 3);
        });
    }

let conductDbOperation = function(reqBody, profile, res) {
    let operation = reqBody.operation;
    let contact = reqBody.contact;
    let note = reqBody.note;
    switch(operation) {
    case 'read':
        console.log('read: ' + profile.email + ' ' + contact.fb_id);
        dbOperator.readNote(profile, contact)
          .then((note) => {
            sendBack(res, 0, note);
        });
        break;
    case 'update':
        console.log('update');
        dbOperator.updateNote(profile, contact, note)
          .then((note) => {
            sendBack(res, 0, note);
        }) ;
        break;
    default:
        sendBack(res, 2);
    }
}

var sendBack = function(res, err, note) {
    console.log(res);
    res.send({error_code: err, note: note});
}
