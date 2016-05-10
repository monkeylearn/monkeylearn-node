'use strict';

var request = require('request');
var Q = require('q');
var sleep = require('sleep');
var MonkeyLearnException = require('./MonkeyLearnException');

function SleepRequests() {}

SleepRequests.prototype.makeRequest = function(url, method, data, sleep_if_throttled) {
    var self = this;
    return Q.nfcall(request, {
        method: method,
        url: url,
        json: true,
        headers: { 'Authorization': 'Token ' + this.token, 'User-Agent': 'node-sdk' },
        body: data
    }).then(function(response) {
        if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('seconds') > -1) {
            var seconds = response[1].detail.match(/available in (\d+) seconds/)[1];
            sleep.sleep(Number(seconds));
            return self.makeRequest(url, method, data, sleep_if_throttled);
        } else if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('Too many concurrent requests') > -1) {
            sleep.sleep(2);
            return self.makeRequest(url, method, data, sleep_if_throttled);
        }

        var deferred = Q.defer();
        if (response[0].statusCode !== 200) {
            deferred.reject(new MonkeyLearnException(response[1].detail));
        } else {
            deferred.resolve(response);
        }

        return deferred.promise;
    });
};

module.exports = SleepRequests;
