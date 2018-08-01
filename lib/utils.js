'use strict';

module.exports = {
  objectToQueryString
};


const reduce = require('lodash/reduce');
const isNull = require('lodash/isNull');
const isUndefined = require('lodash/isUndefined');
const isArray = require('lodash/isArray');

// adapted from https://gist.github.com/TravelingTechGuy/32454b95a50d296912b9
function objectToQueryString (obj) {
    let qs = reduce(obj, (result, value, key) => {
        if (!isNull(value) && !isUndefined(value)) {
            if (isArray(value)) {
                result += reduce(value, (result1, value1) => {
                    if (!isNull(value1) && !isUndefined(value1)) {
                        result1 += key + '=' + value1 + '&';
                        return result1
                    } else {
                        return result1;
                    }
                }, '')
            } else {
                result += key + '=' + value + '&';
            }
            return result;
        } else {
            return result
        }
    }, '').slice(0, -1);
    return qs;
};
