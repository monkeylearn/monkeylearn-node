'use strict';

var settings = require('./Settings');
var MonkeyLearnException = require('./MonkeyLearnException');

module.exports = {
    checkBatchLimits: function(text_list, batch_size) {
        if (batch_size > settings.MAX_BATCH_SIZE || batch_size < settings.MIN_BATCH_SIZE) {
            throw new MonkeyLearnException(
                "batch_size has to be between " + settings.MIN_BATCH_SIZE + " and " + settings.MAX_BATCH_SIZE
            );
        }

        if (!text_list || text_list.length === 0) {
            throw new MonkeyLearnException(
                "The text_list can't be empty."
            );
        }
    }
};
