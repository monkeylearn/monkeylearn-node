'use strict';

var settings = require('./Settings');
var SleepRequests = require('./SleepRequests');
var handleErrors = require('./HandleErrors');
var MonkeyLearnResponse = require('./MonkeyLearnResponse');
var util = require("util");
var Q = require('q');

function Extraction(token, base_endpoint) {
    this.token = token;
    this.endpoint = base_endpoint + 'extractors/';
}

util.inherits(Extraction, SleepRequests);

Extraction.prototype.extract = function(module_id, text_list, callback,
                                        batch_size, sleep_if_throttled) {
    var self = this;
    batch_size = batch_size || settings.DEFAULT_BATCH_SIZE;
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;

    var url = this.endpoint + module_id + '/extract/';

    var promise = Q.fcall(function () {
        handleErrors.checkBatchLimits(text_list, batch_size);
    });

    for (var i = 0; i < text_list.length; i += batch_size) {
        var data = {
            'text_list': text_list.slice(i, i + batch_size)
        }
        if (i === 0) {
            promise = promise.then(function(data) {
                return Q.all([self.makeRequest(url, 'POST', data, sleep_if_throttled)]);
            }.bind(null, data));
        } else {
            promise = promise.then(function(data, response_array) {
                return Q.spread([
                    response_array, self.makeRequest(url, 'POST', data, sleep_if_throttled)],
                    function(response_array, response) {
                        response_array.push(response);
                        return response_array;
                    }
                );
            }.bind(null, data));
        }
    }

    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array, true);
    });

    return promise.nodeify(callback);
};

module.exports = Extraction;
