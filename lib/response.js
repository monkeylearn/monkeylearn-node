'use strict';

module.exports = MonkeyLearnResponse;

const isArray = require('lodash/isArray');
const isPlainObject = require('lodash/isPlainObject');

function MonkeyLearnResponse(raw_responses) {
  this.body = null;
  this.request_queries_used = 0;
  this.plan_queries_allowed = null;
  this.plan_queries_remaining = null;

  this.raw_responses = [];
  if (isPlainObject(raw_responses)) {
    this._add_raw_response(raw_responses)
  } else if (isArray(raw_responses)){
    raw_responses.map(raw_response => this._add_raw_response(raw_response))
  }
}

// raw_response is an object with body, status, headers as returned by request
// it will break if you add more than one raw response that has an error
MonkeyLearnResponse.prototype._add_raw_response = function(raw_response) {
  if (this.raw_responses.length === 0) {
    this.body = raw_response.body;
  } else if (raw_response.status === 200){
    // this response is aggregating more than one request, so assume that the raw_response body is a list
    this.body = this.body.concat(raw_response.body)
  } else {
    // if there was an exception, replace the current concatenated body with the error body
    // all the other responses are still available in this.raw_responses
    this.body = raw_response.body;
  }
  // TODO: consider what to do if the status isn't valid
  this.raw_responses.push(raw_response);

  if (raw_response.status === 200) {
    // the headers come as all lowercase apparently
    this.plan_queries_allowed = parseInt(raw_response.headers['x-query-limit-limit']);
    this.plan_queries_remaining = parseInt(raw_response.headers['x-query-limit-remaining']);
    this.request_queries_used += parseInt(raw_response.headers['x-query-limit-request-queries']);
  }
}
