'use strict';

module.exports = MonkeyLearn;

const defaults = require('lodash/defaults');

const Classifiers = require('./lib/classifiers');

function MonkeyLearn(api_key, settings) {
  if (api_key == undefined) {
    throw new Error('A MonkeyLearn API key is required to use the API. Find yours at https://app.monkeylearn.com/main/my-account/tab/api-keys/');
  }
  settings = settings || {};
  defaults(settings, {
    base_url: 'https://api.monkeylearn.com/v3/',
    retry_if_throttled: true,
    throttling_max_retries: 3
  })

  this.api_key = api_key;
  this.settings = settings;
  this.classifiers = new Classifiers(this);
  this.extractors = 0;
}
