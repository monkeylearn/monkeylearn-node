'use strict';

var TOO_MANY_CONCURRENT_REQUESTS_DELAY = 2000; // 2 seconds

var request = require('request');
var Q = require('q');
var MonkeyLearnException = require('./MonkeyLearnException');
var util = require('util')

function SleepRequests() {

}

SleepRequests.prototype.makeRequest = function (url, method, data, sleep_if_throttled) {
    var self = this;
    return Q.nfcall(request, {
        method: method,
        url: url,
        json: true,
        headers: {'Authorization': 'Token ' + this.token, 'User-Agent': 'node-sdk'},
        body: data
    })
        .then(function (response) {

            // Rate Limited: Sleep specified number of seconds as hinted in response.details
            if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('seconds') > -1) {

                var seconds = response[1].detail.match(/available in (\d+) seconds/)[1];
                var delay = Number(seconds * 1000);

                console.error('MONKEYLEARN_RATE_LIMITED', {delay: delay});
                return Q.delay(delay)
                    .then(() => self.makeRequest(url, method, data, sleep_if_throttled));
            }

            // Too many concurrent requests
            if (sleep_if_throttled && response[0].statusCode === 429
                && response[1].detail.indexOf('Too many concurrent requests') > -1) {

                var delay = TOO_MANY_CONCURRENT_REQUESTS_DELAY;

                console.error('MONKEYLEARN_TOO_MANY_CONCURRENT_REQUESTS', {delay: delay});
                return Q
                    .delay(delay)
                    .then(() => self.makeRequest(url, method, data, sleep_if_throttled));
            }

            // Return a MonkeyLearnException
            if (response[0].statusCode !== 200) {
                return Q.reject(new MonkeyLearnException(response[1].detail || response[1]));
            }

            // Valid Response
            return Q.resolve(response);
        });
};

module.exports = SleepRequests;
