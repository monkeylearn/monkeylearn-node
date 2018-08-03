'use strict';

module.exports = MonkeyLearnError;

// Custom Error class for MonkeyLearn API errors
// this is copied from MDN docs:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
function MonkeyLearnError(error_code, response, message, fileName, lineNumber) {
  let instance = new Error(message, fileName, lineNumber);
  instance.error_code = error_code;
  instance.response = response;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, MonkeyLearnError);
  }
  return instance;
}

MonkeyLearnError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

if (Object.setPrototypeOf){
  Object.setPrototypeOf(MonkeyLearnError, Error);
} else {
  MonkeyLearnError.__proto__ = Error;
}
