'use strict';

// TODO: add retry_if_throttled

module.exports = Classifiers;

const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const defaults = require('lodash/defaults');

const request = require('./request');
const MonkeyLearnError = require('./monkeylearn-api-error');

function Classifiers(options) {
  this.options = options;
  this.base_url = `${options.base_url}classifiers/`;
  this.api_key = options.api_key;
}

Classifiers.prototype.classify = function(model_id, data) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    if (!isArray(data)){
      throw new MonkeyLearnError('', 'A data array is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/`,
      method: 'GET',
      api_key: this.api_key
    })
  ).then(result => result.data)
};

Classifiers.prototype.detail = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/`,
      method: 'GET',
      api_key: this.api_key
    })
  ).then(result => result.data)
};

Classifiers.prototype.create = function(params) {
  return new Promise((resolve, reject) => {
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', 'An object containing the creation parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}`,
      method: 'POST',
      api_key: this.api_key,
      body: params
    })
  ).then(result => result.data)
}

Classifiers.prototype.edit = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', 'An object containing the edit parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/`,
      method: 'PATCH',
      api_key: this.api_key,
      body: params
    })
  ).then(result => result.data)
}

Classifiers.prototype.delete = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/`,
      method: 'DELETE',
      api_key: this.api_key
    })
  ).then(result => {
    return result.data;
  })
};

Classifiers.prototype.list = function(params) {
  return new Promise((resolve, reject) => {
    params = params || {};
    defaults(params, {
      page: 1,
      per_page: 20,
      order_by: '-created'
    })
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', 'Query parameters must be passed as a plain object.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}`,
      method: 'GET',
      api_key: this.api_key,
      query_params: params
    })
  ).then(result => result.data)
};

Classifiers.prototype.deploy = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/deploy/`,
      method: 'POST',
      api_key: this.api_key
    })
  ).then(result => result.data)
};

Classifiers.prototype.train = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/train/`,
      method: 'POST',
      api_key: this.api_key
    })
  ).then(result => result.data)
};

Classifiers.prototype.upload_data = function(model_id, data) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', 'A model_id string is required.');
    }
    if (!isArray(data)){
      throw new MonkeyLearnError('', 'A data array is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/train/`,
      method: 'POST',
      api_key: this.api_key,
      body: {'data': data}
    })
  ).then(result => result.data)
};
