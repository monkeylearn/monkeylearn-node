'use strict';

module.exports = Models;


const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const includes = require('lodash/includes');
const defaults = require('lodash/defaults');
const cloneDeep = require('lodash/cloneDeep');

const request = require('./request').request;
const chain_requests = require('./request').chain_requests;
const MonkeyLearnError = require('./monkeylearn-error');


// base class for endpoints that are in extractors, classifiers and workflows
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

Models.prototype.run = function(model_id, data, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isArray(data)){
      throw new MonkeyLearnError('', null, `A ${this.run_action} data array is required.`);
    }

    params = params || {};
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'Extra parameters must be passed as a plain object.');
    }

    let batches = [];
    if (this.ml.settings.auto_batch) {
      for (let ii=0; ii < data.length; ii+=this.ml.settings.batch_size) {
        // keep all the params except the data list, which will get overloaded
        let batch = cloneDeep(params);
        batch.data = data.slice(ii, ii+this.ml.settings.batch_size);
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
