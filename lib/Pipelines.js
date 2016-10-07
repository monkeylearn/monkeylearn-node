'use strict';

var SleepRequests = require('./SleepRequests');
var MonkeyLearnResponse = require('./MonkeyLearnResponse');
var util = require("util");
var Q = require('q');

function Pipelines(token, base_endpoint) {
    this.token = token;
    this.endpoint = base_endpoint + 'pipelines/';
}

util.inherits(Pipelines, SleepRequests);

Pipelines.prototype.run = function(module_id, data, sandbox, callback,
                                        sleep_if_throttled) {
    var self = this;
    sandbox = sandbox || false;
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;

    var url = this.endpoint + module_id + '/run/';
    if (sandbox) {
        url += '?sandbox=1';
    }

    var promise = Q.all([this.makeRequest(url, 'POST', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

module.exports = Pipelines;
