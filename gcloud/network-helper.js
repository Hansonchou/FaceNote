const authAPI = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=";

module.exports = {
  getUserEmail: function (access_token) {
    console.log("getUserEmail")
    console.log("access_token: " + access_token);
    return getContent_(authAPI + access_token);
  }
}

let getContent_ = function (url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(response.statusCode);
      }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
  })
}
