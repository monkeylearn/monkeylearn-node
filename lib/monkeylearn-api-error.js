'use strict';

module.exports = MonkeyLearnAPIError;

// Custom Error class for MonkeyLearn API errors
// this is copied from MDN docs:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
function MonkeyLearnAPIError(error_code, message, fileName, lineNumber) {
  let instance = new Error(message, fileName, lineNumber);
  instance.error_code = error_code;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, MonkeyLearnAPIError);
  }
  return instance;
}

MonkeyLearnAPIError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

if (Object.setPrototypeOf){
  Object.setPrototypeOf(MonkeyLearnAPIError, Error);
} else {
  MonkeyLearnAPIError.__proto__ = Error;
}
