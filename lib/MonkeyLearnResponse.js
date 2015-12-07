'use strict';

function MonkeyLearnResponse(responses, result_is_array) {
    var result = [];
    for (var i = 0; i < responses.length; i++) {
        result = result.concat(responses[i][1].result);
        this.queryLimitRemaining = responses[i][0].headers['x-query-limit-remaining']
    }

    if (result_is_array) {
        this.result = result;
    } else {
        this.result = result[0];
    }

    this.rawResponses = responses;
}

module.exports = MonkeyLearnResponse;
