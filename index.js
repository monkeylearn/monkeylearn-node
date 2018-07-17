'use strict';

module.exports = MonkeyLearn;

const Classifiers = require('./lib/classifiers');

function MonkeyLearn(api_key, base_url) {
  if (api_key == undefined) {
    throw new Error('A MonkeyLearn API key is required to use the API. Find yours at https://app.monkeylearn.com/main/my-account/tab/api-keys/');
  }
  base_url = base_url || 'https://api.monkeylearn.com/v3/'

  const options = {
    api_key: api_key,
    base_url: base_url
  }

  const api = {
    api_key: api_key,
    base_url: base_url,
    classifiers: new Classifiers(options),
    extractors: 0
  }
  return api
}
