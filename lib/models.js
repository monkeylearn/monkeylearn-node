'use strict';

module.exports = Models;


const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const includes = require('lodash/includes');
const defaults = require('lodash/defaults');
const omit = require('lodash/omit');

const request = require('./request').request;
const chain_requests = require('./request').chain_requests;
const MonkeyLearnError = require('./monkeylearn-error');


// base class for endpoints that are both in extractors and classifiers
function Models(ml, base_url) {
  this.ml = ml;
  this.base_url = base_url;

  if (includes(base_url, 'classifiers')) {
    this.run_action = 'classify';
  } else if (includes(base_url, 'extractors')) {
    this.run_action = 'extract';
  } else {
    this.run_action = undefined;
  }
}

Models.prototype.run = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, `An object containing the ${run_action} parameters is required.`);
    }
    if (!isArray(params.data)){
      throw new MonkeyLearnError('', null, `The ${run_action} parameters must contain a data array.`);
    }

    let batches = [];
    if (this.ml.settings.auto_batch) {
      let data = params.data;
      for (let ii=0; ii < data.length; ii+=ml.settings.batch_size) {
        // keep all the params except the data list, which will get overloaded
        let batch = omit(params);
        batch.data = data.slice(ii, ii+ml.settings.batch_size);
        batches.push(batch)
      }
    } else {
      batches = [params];
    }

    resolve(batches);
  })

  .then(chain_requests(this.ml, `${this.base_url}${model_id}/${this.run_action}/`))
};


Models.prototype.detail = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/`,
      method: 'GET',
    })
  )
};

Models.prototype.list = function(params) {
  return new Promise((resolve, reject) => {
    params = params || {};
    defaults(params, {
      page: 1,
      per_page: 20,
      order_by: '-created'
    })
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'Query parameters must be passed as a plain object.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}`,
      method: 'GET',
      query_params: params
    })
  )
};
