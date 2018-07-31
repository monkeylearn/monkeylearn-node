'use strict';

module.exports = Classifiers;

const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const defaults = require('lodash/defaults');
const omit = require('lodash/omit');

const request = require('./request').request;
const chain_requests = require('./request').chain_requests;
const MonkeyLearnError = require('./monkeylearn-error');

function Classifiers(ml) {
  this.ml = ml;
  this.base_url = `${this.ml.settings.base_url}classifiers/`
}

// takes a params argument with a 'data' keys and separates it into batches
// all the other keys are preserved on every batch
function auto_batch(params, use_auto_batch, batch_size) {
  let batches = [];
  if (use_auto_batch) {
    let data = params.data;
    for (let ii=0; ii < data.length; ii+=batch_size) {
      // keep all the params except the data list, which will get overloaded
      let batch = omit(params);
      batch.data = data.slice(ii, ii+batch_size);
      batches.push(batch)
    }
  } else {
    batches = [params];
  }
  return batches
}

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

    resolve(auto_batch(params, this.ml.settings.auto_batch, ml.settings.batch_size));
  })

  .then(chain_requests(this.ml, `${this.base_url}${model_id}/classify/`))
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
