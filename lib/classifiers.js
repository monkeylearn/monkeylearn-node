'use strict';

module.exports = Classifiers;

const request = require('./request');
const MonkeyLearnError = require('./monkeylearn-api-error');

function Classifiers(options) {
  this.options = options;
  this.base_url = `${options.base_url}classifiers/`;
  this.api_key = options.api_key;
}

Classifiers.prototype.detail = function(model_id) {
  return new Promise((resolve, reject) => {
    if (model_id == undefined) {
      throw new MonkeyLearnError('', 'A model_id is required.');
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
    if (params == undefined) {
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

Classifiers.prototype.delete = function(model_id) {
  return new Promise((resolve, reject) => {
    if (model_id == undefined) {
      throw new MonkeyLearnError('', 'A model_id is required.');
    }
    resolve();
  })

  .then(_ =>
    request({
      url: `${this.base_url}${model_id}/`,
      method: 'DELETE',
      api_key: this.api_key
    })
  ).then(result => result.data)
};
