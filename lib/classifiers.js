'use strict';

module.exports = Classifiers;

const request = require('./request');

function Classifiers(options) {
  this.options = options;
}

Classifiers.prototype.detail = function(model_id) {
  return request({
    url: `${this.options.base_url}classifiers/${model_id}/`,
    method: 'GET',
    headers: {
      Authorization: `Token ${this.options.api_key}`
    }
  })
};
