'use strict';

var settings = require('./Settings');
var SleepRequests = require('./SleepRequests');
var handleErrors = require('./HandleErrors');
var MonkeyLearnResponse = require('./MonkeyLearnResponse');
var MonkeyLearnException = require('./MonkeyLearnException');
var util = require("util");
var Q = require('q');

function Classification(token, base_endpoint) {
    this.token = token;
    this.endpoint = base_endpoint + 'classifiers/';
    this.categories = new Categories(token, base_endpoint);
}

util.inherits(Classification, SleepRequests);

Classification.prototype.classify = function(module_id, text_list, sandbox, callback,
                                             batch_size, sleep_if_throttled) {
    var self = this;
    sandbox = sandbox || false;
    batch_size = batch_size || settings.DEFAULT_BATCH_SIZE;
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;

    var url = this.endpoint + module_id + '/classify/';
    if (sandbox) {
        url += '?sandbox=1';
    }

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

Classification.prototype.list = function(callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint;
    var promise = Q.all([this.makeRequest(url, 'GET', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.detail = function(module_id, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/';
    var promise = Q.all([this.makeRequest(url, 'GET', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.uploadSamples = function(module_id, samples_with_categories, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/samples/';
    var data_samples = [];
    function isArray(a, typeofElems) {
        if((!!a) && (a.constructor === Array)){
            for (var i = 0; i < a.length; i++) {
                if (typeof a[i] !== typeofElems) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    for (var i = 0; i < samples_with_categories.length; i++) {
        var sample;
        var category = samples_with_categories[i][1];
        if (typeof category === "number" || isArray(category, "number")) {
            sample = {
                text: samples_with_categories[i][0],
                category_id: category
            };
        } else if (typeof category === "string" || isArray(category, "string")) {
            sample = {
                text: samples_with_categories[i][0],
                category_path: category
            };
        } else if (!category) {
            sample = {
                text: samples_with_categories[i][0]
            };
        } else {
            throw new MonkeyLearnException(
                'Invalid category value in sample ' + i
            );
        }
        if (samples_with_categories[i].length > 2 && (typeof samples_with_categories[i][2] === "string" ||
                isArray(samples_with_categories[i][2], "string"))) {
            sample.tag = samples_with_categories[i][2];
        }

        data_samples.push(sample);
    }
    var data = {
        samples: data_samples
    };
    var promise = Q.all([this.makeRequest(url, 'POST', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.train = function(module_id, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/train/';
    var promise = Q.all([this.makeRequest(url, 'POST', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.deploy = function(module_id, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/deploy/';
    var promise = Q.all([this.makeRequest(url, 'POST', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.delete = function(module_id, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/';
    var promise = Q.all([this.makeRequest(url, 'DELETE', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Classification.prototype.create = function(
        name, description, train_state, language, ngram_range,
       use_stemmer, stop_words, max_features, strip_stopwords,
       is_multilabel, is_twitter_data, normalize_weights,
       classifier, industry, classifier_type, text_type,
       permissions, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;

    var data_dirty = {
        "name": name,
        "description": description,
        "train_state": train_state,
        "language": language,
        "ngram_range": ngram_range,
        "use_stemmer": use_stemmer,
        "stop_words": stop_words,
        "max_features": max_features,
        "strip_stopwords": strip_stopwords,
        "is_multilabel": is_multilabel,
        "is_twitter_data": is_twitter_data,
        "normalize_weights": normalize_weights,
        "classifier": classifier,
        "industry": industry,
        "classifier_type": classifier_type,
        "text_type": text_type,
        "permissions": permissions
    }

    var data = {};

    for (var key in data_dirty) {
        if (data_dirty.hasOwnProperty(key)) {
            if (data_dirty[key]) {
                data[key] = data_dirty[key];
            }
        }
    }

    var url = this.endpoint;
    var promise = Q.all([this.makeRequest(url, 'POST', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

function Categories(token, base_endpoint) {
    this.token = token;
    this.endpoint = base_endpoint + 'classifiers/';
}

util.inherits(Categories, SleepRequests);

Classification.prototype.detail = function(module_id, category_id, callback, sleep_if_throttled) {
    sleep_if_throttled = typeof sleep_if_throttled !== 'undefined' ?  sleep_if_throttled : true;
    var url = this.endpoint + module_id + '/categories/' + category_id + '/';
    var promise = Q.all([this.makeRequest(url, 'GET', null, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Categories.prototype.create = function(module_id, name, parent_id, callback, sleep_if_throttled) {
    var data = {
        "name": name,
        "parent_id": parent_id
    }

    var url = this.endpoint + module_id + '/categories/';
    var promise = Q.all([this.makeRequest(url, 'POST', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Categories.prototype.edit = function(module_id, category_id, name, parent_id,
                                     callback, sleep_if_throttled) {
    var data_dirty = {
        "name": name,
        "parent_id": parent_id
    }

    var data = {};

    for (var key in data_dirty) {
        if (data_dirty.hasOwnProperty(key)) {
            if (data_dirty[key]) {
                data[key] = data_dirty[key];
            }
        }
    }

    var url = this.endpoint + module_id + '/categories/' + category_id + '/';
    var promise = Q.all([this.makeRequest(url, 'POST', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

Categories.prototype.delete = function(module_id, category_id, samples_strategy,
                                       samples_category_id, callback, sleep_if_throttled) {
    var data_dirty = {
        "samples-strategy": samples_strategy,
        "samples-category-id": samples_category_id
    }

    var data = {};

    for (var key in data_dirty) {
        if (data_dirty.hasOwnProperty(key)) {
            if (data_dirty[key]) {
                data[key] = data_dirty[key];
            }
        }
    }

    var url = this.endpoint + module_id + '/categories/' + category_id + '/';
    var promise = Q.all([this.makeRequest(url, 'DELETE', data, sleep_if_throttled)]);
    promise = promise.then(function (response_array) {
        return new MonkeyLearnResponse(response_array);
    });
    return promise.nodeify(callback);
};

module.exports = Classification;
