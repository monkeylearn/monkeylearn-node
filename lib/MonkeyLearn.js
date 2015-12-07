'use strict';

var settings = require('./Settings');
var Classification = require('./Classification');
var Extraction = require('./Extraction');
var Pipelines = require('./Pipelines');

function MonkeyLearn(token, base_endpoint) {
    base_endpoint = base_endpoint || settings.DEFAULT_BASE_ENDPOINT;
    this.classifiers = new Classification(token, base_endpoint);
    this.extractors = new Extraction(token, base_endpoint);
    this.pipelines = new Pipelines(token, base_endpoint);
}

module.exports = MonkeyLearn;
