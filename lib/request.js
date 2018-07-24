'use strict';

module.exports = request;

const fetch = require('node-fetch').default;
const defaultsDeep = require('lodash/defaultsDeep');
const isPlainObject = require('lodash/isPlainObject');
const pick = require('lodash/pick');

const objectToQueryString = require('./utils').objectToQueryString;
const MonkeyLearnError = require('./monkeylearn-api-error');

const default_seconds_to_retry = 2;
const default_max_retries = 3;

// adapted from rest.js https://github.com/octokit/rest.js/blob/master/lib/request/request.js
// requestOptions will get passed to fetch, but also:
//   takes the "query_params" param, which is an object
//   takes the "retries" param, which is a number
function request(ml, requestOptions) {

  defaultsDeep(requestOptions, {
    headers: {
      // TODO: put the SDK version in the user agent as well
      'User-Agent': `node-sdk`,
      'authorization': `Token ${ml.api_key}`
    },
    query_params: {},
    retries: ml.settings.throttling_max_retries,
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

      let retry_if_throttled = true;

      if (status === 429 && ml.settings.retry_if_throttled) {
        // logic for retry if throttled
        return response.json()
          .then(res => {
            let seconds_to_wait;
            if (res.error_code === 'PLAN_RATE_LIMIT') {
              seconds_to_wait = res.seconds_to_wait + 1
            } else if (res.error_code === 'CONCURRENCY_RATE_LIMIT') {
              seconds_to_wait = default_seconds_to_retry
            } else {
              throw new MonkeyLearnError(res.error_code, res.detail);
            }
            // based on https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain
            return new Promise((resolve, reject) => setTimeout(resolve, seconds_to_wait * 1000, res))
          })

          .then((res) => {
            requestOptions.retries -= 1;
            if (requestOptions.retries === 0) {
              // TODO: maybe "you've retried too many times" error?
              throw new MonkeyLearnError(res.error_code, res.detail);
            }
            return request(ml, requestOptions);
          })

      } else if (status >= 400) {
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
