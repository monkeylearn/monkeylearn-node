'use strict';

module.exports = Classifiers;

const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isInteger = require('lodash/isInteger');
const isPlainObject = require('lodash/isPlainObject');

const Models = require('./models');
const request = require('./request').request;
const MonkeyLearnError = require('./monkeylearn-error');


function Classifiers(ml) {
  Models.call(this, ml, `${ml.settings.base_url}classifiers/`)
  this.tags = new Tags(this);
}

Classifiers.prototype = Object.create(Models.prototype);
Classifiers.prototype.constructor = Classifiers;

Classifiers.prototype.classify = Classifiers.prototype.run;

// classifier detail is handled by Models

// list classifiers is handled by Models

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
      url: `${this.base_url}${model_id}/data/`,
      method: 'POST',
      body: {'data': data}
    })
  )
};



function Tags(classifiers) {
  this.ml = classifiers.ml;
  this.classifiers = classifiers;
}

Tags.prototype.detail = function(model_id, tag_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isString(tag_id) && !isInteger(tag_id)) {
      throw new MonkeyLearnError('', null, 'A tag_id string or integer is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.classifiers.base_url}${model_id}/tags/${tag_id}/`,
      method: 'GET',
    })
  )
};

Tags.prototype.create = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the creation parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.classifiers.base_url}${model_id}/tags/`,
      method: 'POST',
      body: params
    })
  )
}

Tags.prototype.edit = function(model_id, tag_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isString(tag_id) && !isInteger(tag_id)) {
      throw new MonkeyLearnError('', null, 'A tag_id string or integer is required.');
    }
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the edit parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.classifiers.base_url}${model_id}/tags/${tag_id}/`,
      method: 'PATCH',
      body: params
    })
  )
}

Tags.prototype.delete = function(model_id, tag_id) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isString(tag_id) && !isInteger(tag_id)) {
      throw new MonkeyLearnError('', null, 'A tag_id string or integer is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.classifiers.base_url}${model_id}/tags/${tag_id}/`,
      method: 'DELETE'
    })
  )
}
