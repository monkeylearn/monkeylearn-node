'use strict';

module.exports = Classifiers;

const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const defaults = require('lodash/defaults');

const request = require('./request');
const MonkeyLearnError = require('./monkeylearn-error');
const MonkeyLearnResponse = require('./response');

function Classifiers(ml) {
  this.ml = ml;
  this.base_url = `${this.ml.settings.base_url}classifiers/`
}

// TODO: ask gonz if this is the best way to pass the parameters
Classifiers.prototype.classify = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the classification parameters is required.');
    }
    if (!isArray(params.data)){
      throw new MonkeyLearnError('', null, 'The classification parameters must contain a data array.');
    }

    let batches = [];
    let parse_response;
    if (this.ml.settings.auto_batch) {
      batches = [params];
      parse_response = false;
      console.log(parse_response)
    } else {
      batches = [params];
      parse_response = true;
    }
    resolve(batches);
  })

  .then(batches =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/classify/`,
      method: 'POST',
      body: batches[0],
      // TODO: fix this, make parse_response false only when there is batching
      parse_response: false
    })
  )
  // .then(raw_response => new MonkeyLearnResponse(raw_response))
  // .catch(error => {
  //   if (error.hasOwnProperty('response')) {
  //     error.response = new MonkeyLearnResponse(error.response);
  //   }
  //   throw error;
  // })
};

Classifiers.prototype.detail = function(model_id) {
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

Classifiers.prototype.create = function(params) {
  return new Promise((resolve, reject) => {
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the creation parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}`,
      method: 'POST',
      body: params
    })
  )
}

Classifiers.prototype.edit = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the edit parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/`,
      method: 'PATCH',
      body: params
    })
  )
}

Classifiers.prototype.delete = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/`,
      method: 'DELETE',
    })
  ).then(result => {
    return result.body;
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

Classifiers.prototype.deploy = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/deploy/`,
      method: 'POST',
    })
  )
};

Classifiers.prototype.train = function(model_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/train/`,
      method: 'POST',
    })
  )
};

Classifiers.prototype.upload_data = function(model_id, data) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isArray(data)){
      throw new MonkeyLearnError('', null, 'A data array is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.base_url}${model_id}/train/`,
      method: 'POST',
      body: {'data': data}
    })
  )
};
