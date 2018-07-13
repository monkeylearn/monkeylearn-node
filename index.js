'use strict';

module.exports = MonkeyLearn;

const Classifiers = require('./lib/classifiers');

function MonkeyLearn(options) {
  if (!options.hasOwnProperty('api_key')) {
    throw new Error('A MonkeyLearn api key is required.');
  }
  if (!options.hasOwnProperty('base_url')) {
    options.base_url = 'https://api.monkeylearn.com/v3/';
  }
  const api = {
    api_key: options.api_key,
    base_url: options.base_url,
    classifiers: new Classifiers(options),
    extractors: 0
  }
  return api
}
