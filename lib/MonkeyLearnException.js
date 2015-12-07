'use strict';

var util = require("util");

function MonkeyLearnException(message) {
   this.message = message;
   this.name = "MonkeyLearnException";
}

util.inherits(MonkeyLearnException, Error);

module.exports = MonkeyLearnException;
