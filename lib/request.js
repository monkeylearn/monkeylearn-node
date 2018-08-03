'use strict';

module.exports = {request, chain_requests};

const fetch = require('node-fetch').default;
const defaultsDeep = require('lodash/defaultsDeep');
const isPlainObject = require('lodash/isPlainObject');
const pick = require('lodash/pick');

const version = require('../package.json').version;
const objectToQueryString = require('./utils').objectToQueryString;
const MonkeyLearnError = require('./monkeylearn-error');
const MonkeyLearnResponse = require('./response');

const default_seconds_to_retry = 2;
const default_max_retries = 3;

// adapted from rest.js https://github.com/octokit/rest.js/blob/master/lib/request/request.js
// requestOptions will get passed to fetch, but also takes the:
//   "query_params" param, which is an object
//   "retries" param, which is a number
//   "parse_response", which is a boolean that indicates if the response should be a MonkeyLearnResponse
//    or a raw_response, which is an object {body, status, headers}
//    this adds a MonkeyLearnResponse to the errors
function request(ml, requestOptions) {

  defaultsDeep(requestOptions, {
    headers: {
      // TODO: test that the user agent is working properly
      'User-Agent': `node-sdk-${version}`,
      'authorization': `Token ${ml.api_key}`
    },
    query_params: {},
    retries: ml.settings.throttling_max_retries,
    parse_response: true,
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

      if (status === 429 && ml.settings.retry_if_throttled) {
        // logic for retry if throttled
        return response.json()
          .then(body => {
            let seconds_to_wait;
            if (body.error_code === 'PLAN_RATE_LIMIT') {
              seconds_to_wait = body.seconds_to_wait + 1
            } else if (body.error_code === 'CONCURRENCY_RATE_LIMIT') {
              seconds_to_wait = default_seconds_to_retry
            } else {
              throw new MonkeyLearnError(body.error_code, {body, status, headers}, body.detail);
            }
            // based on https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain
            return new Promise((resolve, reject) => setTimeout(resolve, seconds_to_wait * 1000, body))
          })

          .then((body) => {
            requestOptions.retries -= 1;
            if (requestOptions.retries === 0) {
              throw new MonkeyLearnError(body.error_code, {body, status, headers}, `${body.detail} [SDK reached limit of throttling retries]`);
            }
            return request(ml, requestOptions);
          })

      } else if (status >= 400) {
        return response.json()
          .then(body => {
            throw new MonkeyLearnError(body.error_code, {body, status, headers}, body.detail);
          })
      }

      const contentType = response.headers.get('content-type')
      if (/application\/json/.test(contentType)) {
        return response.json()
          // create a raw_response
          .then(body => {return {body, status, headers}})
      }

      // default case
      return response.buffer()
        // create a raw_response
        .then(body => {return {body, status, headers}})
    })

    .then(response => {
      // The response that reaches this step may or may not be a raw_response.
      // (depends on auto retry)
      // If it is a parsed response, just let it through unchanged
      if (requestOptions.parse_response && !response.hasOwnProperty('raw_responses')) {
        return new MonkeyLearnResponse(response);
      }
      return response
    })

    .catch(error => {
      // Transform the response inside the error (if present) into a MonkeyLearnResponse
      // if it isn't one already.
      if (requestOptions.parse_response
          && error.hasOwnProperty('response')
          && !error.response.hasOwnProperty('raw_responses')) {
        error.response = new MonkeyLearnResponse(error.response);
      }
      throw error;
    })


}


// returns a function that takes an array of batches and generates a request for each
// the requests are done sequentially
function chain_requests(ml, url) {
  return (batches) => {
    let promise = new Promise((resolve, reject) => resolve(new MonkeyLearnResponse()));

    // attach requests for all the batches sequentially to the original promise and return _that_
    return batches.reduce((promise, batch) =>
      promise.then((response) =>

        request(ml, {
          url: url,
          method: 'POST',
          body: batch,
          parse_response: false
        })

        .then(raw_response => {
          response._add_raw_response(raw_response);
          return response;
        })

        .catch(error => {
          if (error.hasOwnProperty('response')) {
            response._add_raw_response(error.response);
            error.response = response;
          } else {
            // if it's not a MonkeyLearn Error (so, some other js runtime error),
            // return as-is but add the response
            // not the cleanest solution but I don't want the error to lose the context
            error.response = response;
            error.error_code = '';
          }
          throw error;
        })
      )
    , promise)
  }
}
