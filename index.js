'use strict';

module.exports = MonkeyLearn;

const defaults = require('lodash/defaults');
const isString = require('lodash/isString');

const MonkeyLearnError = require('./lib/monkeylearn-error');
const Classifiers = require('./lib/classifiers');
const Extractors = require('./lib/extractors');
const Workflows = require('./lib/workflows');

function MonkeyLearn(api_key, settings) {
  if (!isString(api_key)) {
    throw new MonkeyLearnError('', null, 'A MonkeyLearn API key string is required to use the API. Find yours at https://app.monkeylearn.com/main/my-account/tab/api-keys/');
  }
  settings = settings || {};
  defaults(settings, {
    base_url: 'https://api.monkeylearn.com/v3/',
    retry_if_throttled: true,
    throttling_max_retries: 3,
    auto_batch: true,
    batch_size: 200
  })

  this.api_key = api_key;
  this.settings = settings;
  this.classifiers = new Classifiers(this);
  this.extractors = new Extractors(this);
  this.workflows = new Workflows(this);
}
