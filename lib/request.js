'use strict';

module.exports = request;

const fetch = require('node-fetch').default;
const defaultsDeep = require('lodash/defaultsDeep');
const isPlainObject = require('lodash/isPlainObject');
const pick = require('lodash/pick');

const objectToQueryString = require('./utils').objectToQueryString;
const MonkeyLearnError = require('./monkeylearn-api-error');

// adapted from rest.js https://github.com/octokit/rest.js/blob/master/lib/request/request.js
// takes the "api_key" param, which is in charge of auth
// takes the "query_params" param, which is an object
function request(requestOptions) {

  defaultsDeep(requestOptions, {
    headers: {
      // TODO: put the SDK version in the user agent as well
      'User-Agent': `node-sdk`,
      'authorization': `Token ${requestOptions.api_key}`
    },
    query_params: {}
  })

  if (requestOptions.body) {
    defaultsDeep(requestOptions.headers, {
      'content-type': 'application/json'
    })
  }

  // https://fetch.spec.whatwg.org/#methods
  requestOptions.method = requestOptions.method.toUpperCase();

  if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let url = `${requestOptions.url}?${objectToQueryString(requestOptions.query_params)}`

  let headers = {};
  let status;

  return fetch(url, pick(requestOptions, 'method', 'body', 'headers'))
    .then(response => {
      status = response.status;
      for (const keyAndValue of response.headers.entries()) {
        headers[keyAndValue[0]] = keyAndValue[1]
      }

      // TODO: maybe better error handling?
      if (status >= 400) {
        return response.json()
          .then(res => {
            throw new MonkeyLearnError(res.error_code, res.detail);
          })
      }

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
      // TODO: handle other errors
      throw error;
    })


}
