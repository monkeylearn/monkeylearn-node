'use strict'

module.exports = request;

const fetch = require('node-fetch').default;
const defaults = require('lodash/defaults');
const isPlainObject = require('lodash/isPlainObject');
const pick = require('lodash/pick');

// adapted from rest.js https://github.com/octokit/rest.js/blob/master/lib/request/request.js
function request(requestOptions) {

  if (requestOptions.body) {
    // TODO: check if this actually works (does the function modify the object?)
    defaults(requestOptions.headers, {
      'content-type': 'application/json'
    })
  }

  // https://fetch.spec.whatwg.org/#methods
  requestOptions.method = requestOptions.method.toUpperCase();

  if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  // TODO: put the version in the user agent
  requestOptions.headers['User-Agent'] = `node-sdk`;

  let headers = {};
  let status;

  return fetch(requestOptions.url, pick(requestOptions, 'method', 'body', 'headers'))
    .then(response => {
      status = response.status;
      for (const keyAndValue of response.headers.entries()) {
        headers[keyAndValue[0]] = keyAndValue[1]
      }

      // TODO: error handling

      const contentType = response.headers.get('content-type')
      if (/application\/json/.test(contentType)) {
        return response.json();
      }

      // default case
      return response.buffer();
    })

    .then(data => {
      return {
        data,
        status,
        headers
      }
    })

    .catch(error => {
      // TODO: handle errors
      throw error;
    })


}
