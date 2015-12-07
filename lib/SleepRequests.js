'use strict';

var request = require('request');
var Q = require('q');
var sleep = require('sleep');

function SleepRequests() {}

SleepRequests.prototype.makeRequest = function(url, method, data, sleep_if_throttled) {
    var self = this;
    var rPromise = Q.nfcall(request, {
        method: method,
        url: url,
        json: true,
        headers: { 'Authorization': 'Token ' + this.token },
        body: data
    });
    rPromise.then(function(response) {
        // console.log(response[0].headers);
        // console.log(response[0].statusCode);
        // console.log(typeof response[1].result);

        if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('seconds') > -1) {
            var seconds = response[1].detail.match(/available in (\d+) seconds/)[1];
            sleep.sleep(seconds);
            return self.makeRequest(url, method, data, sleep_if_throttled);
        } else if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('Too many concurrent requests') > -1) {
            sleep.sleep(2);
            return self.makeRequest(url, method, data, sleep_if_throttled);
        }
        var deferred = Q.defer();
        deferred.resolve(response);
        return deferred.promise;
    });

    return rPromise;
};

module.exports = SleepRequests;
