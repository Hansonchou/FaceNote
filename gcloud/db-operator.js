// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/latest/guides/authentication
const Datastore = require('@google-cloud/datastore');

// Instantiates a client
const datastore = Datastore();

module.exports = {
  readNote: function (userProfile, contact) {
    console.log('readNote');
    createOrUpdateUserEntityIfOutdated_(userProfile);
    return getNote_(userProfile.email, contact.fb_id);
  },

  updateNote: function (userProfile, contact, note) {
    console.log('updateNote');
    createOrUpdateUserEntityIfOutdated_(userProfile);
    return updateNote_(userProfile.email, contact, note);
  }
};

let getNote_ = function (userEmail, contactId) {
  console.log('getNote: ' + userEmail + ' ' + contactId);
  const contactKey = datastore.key([
        'User',
        userEmail,
        'Contact',
        contactId
    ]);
  return getEntity_(contactKey)
    .then((contact) => {
      if (contact) {
        console.log(contact.note);
        return {
          fb_id: contactId,
          note_content: contact.note,
          updated: contact.updated
        };
      } else {
        return {
          note_content: ''
        };
      }
    });
}

let updateNote_ = function (userEmail, contact, note) {
  console.log('updateNote: ' + userEmail + " " + contact.fb_id + " " + note);
  const contactKey = getContactKey(userEmail, contact.fb_id);
  const contactContent = {
    name: contact.name,
    note: note,
    updated: new Date()
  };

  const contactEntity = {
    key: contactKey,
    data: contactContent
  };

  return datastore.upsert(contactEntity)
    .then(() => {
      // Task inserted successfully.
      console.log("complete update: ")
      console.log(contactEntity);
      return getNote_(userEmail, contact.fb_id);
    });
}

let createOrUpdateUserEntityIfOutdated_ = function (profile) {
  console.log('createOrUpdateUserEntityIfOutdated_');
  const userKey = getUserKey_(profile.email);
  // TODO: only update if not exist or if too old.
  updateUser_(userKey, profile);
};

let updateUser_ = function (userKey, profile) {
  console.log('updateUser');
  profile.updated = new Date();
  console.log(profile);
  const user = {
    key: userKey,
    data: profile
  };
  datastore.upsert(user)
    .then(() => {
      // Task inserted successfully.
      console.log("complete update: ")
      console.log(user);
    });
}

let getEntity_ = function (key) {
  console.log('getEntity');
  return datastore.get(key)
    .then((results) => {
      const entity = results[0];
      console.log(entity);
      return entity;
    });
}

let getUserKey_ = function (userEmail) {
  return datastore.key([
        'User',
        userEmail,
    ]);
}

let getContactKey = function (userEmail, contact_id) {
  return datastore.key([
        'User',
        userEmail,
        'Contact',
        contact_id
    ]);
}
