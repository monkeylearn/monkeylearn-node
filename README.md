# monkeylearn-node
Official Node client for the MonkeyLearn API. Build and consume machine learning models for language processing from your Node apps.

Install
-------

You can use npm to install the library:

    npm install monkeylearn
    

Usage examples
--------------

Here are some examples of how to use the library in order to create and use classifiers:
```javascript
var MonkeyLearn, ml, p, model_id, root_id, negative_id, positive_id, samples;

MonkeyLearn = require('monkeylearn');

// Use the API key from your account
ml = new MonkeyLearn('<YOUR API KEY HERE>');

// Create a new classifier
p = ml.classifiers.create('Test Classifier').then(function (res) {
    // Get the id of the new module    
    model_id = res.result.classifier.hashed_id
    
    // Get the classifier detail
    return ml.classifiers.detail(model_id);
}).then(function (res) {    
    // Get the id of the root node
    root_id = res.result.sandbox_tags[0].id
    
    // Create a negative tag on the root node
    return ml.classifiers.tags.create(model_id, 'Negative', root_id);
}).then(function (res) {   
    // Get the id of the negative tag
    negative_id = res.result.tag.id
    
    // Create a positive tag on the root node
    return ml.classifiers.tags.create(model_id, 'Positive', root_id);
}).then(function (res) {    
    // Get the id of the positive tag
    positive_id = res.result.tag.id
    
    // Now let's upload some samples
    samples = [['The movie was terrible, I hated it.', negative_id], ['I love this movie, I want to watch it again!', positive_id]];
    return ml.classifiers.uploadSamples(model_id, samples);
}).then(function (res) {    
    // Now let's train the module!
    return ml.classifiers.train(model_id);
}).then(function (res) {
    // Classify some texts
    return ml.classifiers.classify(model_id, ['I love the movie', 'I hate the movie'], true);
}).then(function (res) {    
    console.log(res.result);
});
```
You can also use the sdk with extractors and pipelines:

```javascript
var MonkeyLearn = require('monkeylearn');
var ml = new MonkeyLearn('<YOUR API KEY HERE>');
var res = ml.extractors.extract('<Extractor ID>', ['Some text for the extractor.', 'Some more text']);
var res = ml.pipelines.run('<Pipeline ID>', {'input':[{'text': 'some text for the pipeline.'}]}, false);
```
