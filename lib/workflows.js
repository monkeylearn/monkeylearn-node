'use strict';

module.exports = Workflows;

const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isInteger = require('lodash/isInteger');
const isPlainObject = require('lodash/isPlainObject');

const Models = require('./models');
const request = require('./request').request;
const MonkeyLearnError = require('./monkeylearn-error');


function Workflows(ml) {
  Models.call(this, ml, `${ml.settings.base_url}workflows/`)
  this.steps = new WorkflowSteps(this);
  this.data = new WorkflowData(this);
  this.custom_fields = new WorkflowCustomFields(this);
}

Workflows.prototype = Object.create(Models.prototype);
Workflows.prototype.constructor = Workflows;

Workflows.prototype.run = undefined;
Workflows.prototype.list = undefined;

// workflows detail is handled by Models

Workflows.prototype.create = function(params) {
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
};

Workflows.prototype.delete = function(model_id) {
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

function WorkflowSteps(workflows) {
  this.ml = workflows.ml;
  this.workflows = workflows;
}

WorkflowSteps.prototype.create = function(model_id, params) {
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
      url: `${this.workflows.base_url}${model_id}/steps/`,
      method: 'POST',
      body: params
    })
  )
}

function WorkflowData(workflows) {
  this.ml = workflows.ml;
  this.workflows = workflows;
}

WorkflowData.prototype.create = function(model_id, data) {
  let params = {'data': data}

  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    if (!isArray(data)){
      throw new MonkeyLearnError('', null, 'A data array is required');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.workflows.base_url}${model_id}/data/`,
      method: 'POST',
      body: params
    })
  )
}

WorkflowData.prototype.list = function(model_id, params) {
  return new Promise((resolve, reject) => {
    if (!isString(model_id)) {
      throw new MonkeyLearnError('', null, 'A model_id string is required.');
    }
    params = params || {};
    if (!isPlainObject(params)) {
      throw new MonkeyLearnError('', null, 'An object containing the list parameters is required.');
    }
    resolve();
  })

  .then(_ =>
    request(this.ml, {
      url: `${this.workflows.base_url}${model_id}/data/`,
      method: 'GET',
      query_params: params
    })
  )
}

function WorkflowCustomFields(workflows) {
  this.ml = workflows.ml;
  this.workflows = workflows;
}

WorkflowCustomFields.prototype.create = function(model_id, params) {
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
      url: `${this.workflows.base_url}${model_id}/custom-fields/`,
      method: 'POST',
      body: params
    })
  )
}
