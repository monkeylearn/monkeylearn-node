# monkeylearn-node
Official Node client for the MonkeyLearn API. Build and consume machine learning models for language processing from your Node apps.

## Install

You can use npm to install the library:

```bash
$ npm install monkeylearn
```

Alternatively, you can just clone the repository and install:

```bash
$ cd monkeylearn-node/
$ npm install
```

## Simple usage examples

Here are some examples of how to use the library in order to make classifications:

```javascript
const MonkeyLearn = require('monkeylearn')

// Use the API key from your account
const ml = new MonkeyLearn('<YOUR API KEY HERE>')

// Classify some texts
let model_id = 'cl_pi3C7JiL'
// the full options are described in the docs: https://monkeylearn.com/api/v3/#classify
let data = [
    'Some text to classify',
    {
        text: 'You can also send text inside an object like this'
    },
    {
        text: 'And include an external id',
        external_id: '195619'
    }
]

ml.classifiers.classify(model_id, data).then(response => {
        // handle response
        console.log(response)
        console.log(response.body)
    }).catch(error => {
        // handle error
        console.log(error)
        // if an error is thrown during the request
        // it will also contain the (failure) response
        console.log(error.response)
    })
```

On a successful classification, `response.body` would look like this:
```javascript
// This is exactly the parsed JSON that the MonkeyLearn API returns!
[{
    text: "This is the best sentiment analysis tool ever!!!",
    external_id: null,
    error: false,
    classifications: [{
        tag_name: "Positive",
        tag_id: 55180725,
        confidence: 1
    }]
}, {
    text: "This is absolutely awful!",
    external_id: "195619",
    error: false,
    classifications: [{
        tag_name: "Negative",
        tag_id: 55180726,
        confidence: 0.999
    }]
}]
```

The same is true for extractors:
```javascript
let model_id = 'ex_wNDME4vE'
// the full options are described in the docs: https://monkeylearn.com/api/v3/#extract
let data = [
    'The gorilla exhibit is open every day from 10am, except for December 25th. \
    We have FREE on-site parking! We will host an exclusive orangutan show on \
    November 5th, 2013 at 2 pm. Don\'t be late!'
]

ml.extractors.extract(model_id, data).then(response => {
        // handle response
        console.log(response)
        console.log(response.body)
    }).catch(error => {
        // handle error
        console.log(error)
        // if an error is thrown during the request
        // it will also contain the (failure) response
        console.log(error.response)
    })
```

And this is the `response.body`:
```javascript
[{
    text: "The gorilla exhibit is open every day from 10am, except for December 25th. \
    We have FREE on-site parking! We will host an exclusive orangutan show on \
    November 5th, 2013 at 2 pm. Don't be late!",
    external_id: null,
    error: false,
    extractions: [{
        tag_name: "TIME",
        extracted_text: "10am",
        parsed_value: "10:00:00",
        offset_span: [43, 46]
    }, {
        tag_name: "DATE",
        extracted_text: "December 25th.",
        parsed_value: "2018-12-25T00:00:00",
        offset_span: [60, 73]
    }, {
        tag_name: "DATE",
        extracted_text: "on November 5th, 2013 at 2 pm.",
        parsed_value: "2013-11-05T14:00:00",
        offset_span: [146, 175]
    }]
}]
```

---
## Responses and Errors

Every function returns a promise (default promises are used) that resolves with an object of type `MonkeyLearnResponse`, which represents the response of the API to a query (with auto batching enabled, this can mean more than one actual request).
This object contains the `body` of the response, plus some conveniently parsed headers:

- `plan_queries_allowed`: The total of [queries](http://help.monkeylearn.com/frequently-asked-questions/queries/what-is-a-query-in-monkeylearn) that on your plan
- `plan_queries_remaining`: How many queries you have left this month.
- `request_queries_used`: The number of queries that were spent on this call.

A response also has a `raw_responses` array, which has all the actual responses that were sent by the API.
Usually this is only needed in case of an error.
These raw responses are objects with the following attributes: `body`, `status`, `headers`.

If the promise is rejected for some reason (usually some [API error response](https://monkeylearn.com/api/v3/#error-responses)), an error of type MonkeyLearnError is raised.
This object has the following attributes:
- `message`: The error message. If it was an API error, it's the API error message.
- `error_code`: The [API error code](https://monkeylearn.com/api/v3/#error-codes). Only present if the error actually comes from an API error, and not some other runtime error.
- `response`: The MonkeyLearnResponse of this request. You can use this to troubleshoot the error in detail. Only present if the error actually comes from an API error, and not some other runtime error.


### Auto batching

The MonkeyLearn API has a hard limit on how many texts you can send at once to classify or extract.
So, through the API you can never send more than 500 texts on a single request.
If you wanted classify more than this, you'd have to divide your text list into batches of size 500 and send several requests.
This library solves this problem for you: you can send as many texts as you want on `classifiers.classify` and `extractors.extract` and it _just works_.

For example:
```javascript
const ml = new MonkeyLearn('<YOUR API KEY HERE>', {
    // true is the default
    // you can set it to false if you want to handle it yourself
    auto_batch: true,
    batch_size: 200
})

const data = [ /*A list of 10 000 texts*/]

ml.classifiers,classify(model_id, data).then(response => {
        console.log(response.body.length)
    }).catch(error => {
        // error handling
    })

> 10000
```

So, what happened here is that several requests were actually made in succession, and the results were concatenated together as though it was only one request.

#### Error handling

There's one risk though, which is best explained through an example: let's say that you're sending 1000 texts in batches of 200, which means that 5 requests will be made one after the other.
Imagine now that the first two are successful classifications, but the third one fails (this can happen if, for instance, you run out of queries).
Now you have used up 400 of your queries, and if you just let the error go through you have nothing to show for it.
This is no good.

What you can do about this is that the returned MonkeyLearnError actually contains the _partial_ response that was going to be returned in `error.response`.
Now, `error.response.body` in this case will contain the body of the [429 error response](https://monkeylearn.com/api/v3/#error-responses); the response of that third request (requests 4 and 5 are never sent).
However, `error.response.raw_responses` contains _all_ the responses, the first two being the successful ones that contain the first 400 classified texts, and the third one being the failure.

So, in case of error, something like this should be done in order to not waste the used queries:
```javascript
ml.classifiers,classify(model_id, data).then(response => {
        // handle a successful response
        return response.body
    }).catch(error => {
        // if there's an error, concat the results of all the successful responses
        return error.response.raw_responses.reduce((body, raw_res) => {
            if (raw_res.status !== 200) {
                return body
            }
            return body.concat(raw_res.body)
        }, [])
    })
```

### Auto retry on throttling

Sending too many requests can result in [throttling](https://monkeylearn.com/api/v3/#rate-limiting) being applied.
The API mandates a certain wait time before retrying the request; this is handled by this library as well.
The number of max retries before reporting failure is 3, and can be configured in the settings.

The unsuccessful responses are not stored in the `raw_responses` array of the final response that is returned.

```javascript
const ml = new MonkeyLearn('<YOUR API KEY HERE>', {
    // these are the default throttling settings
    retry_if_throttled: true,
    throttling_max_retries: 3
})
```

---

## Other usage examples
You can access all the MonkeyLearn API with this library, not just the classification and extraction endpoints.

### [Classifiers](https://monkeylearn.com/api/v3/#classifier-detail)

List classifiers:
```javascript
ml.classifiers.list().then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Create classifier:
```javascript
let model_id
ml.classifiers.create({
    name: 'New Classifier',
    description: 'This is a new classifier',
    algorithm: 'nb',
    ngram_range: [1, 1]
}).then(response => {
    console.log(response.body)
    model_id = response.body.id
}).catch(error => {
    console.log(error)
})
```

Classifier detail:
```javascript
ml.classifiers.detail(model_id).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Edit classifier:
```javascript
ml.classifiers.edit(model_id, {
    description: 'New description for the classifier'
}).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Upload data:
```javascript
ml.classifiers.upload_data(model_id, [{
    text: 'First text':
    tags: ['Tag 1']
}, {
    text: 'Second text':
    tags: ['Tag 2']
}]).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Deploy classifier:
```javascript
ml.classifiers.deploy(model_id).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```

Delete classifier:
```javascript
ml.classifiers.delete(model_id).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```



### [Classifier tags](https://monkeylearn.com/api/v3/#tag-detail)

Create tag:
```javascript
let tag_id
ml.classifiers.tags.create(model_id, {
    name: 'New tag'
}).then(response => {
    console.log(response.body)
    tag_id = response.body.tag_id
}).catch(error => {
    console.log(error)
})
```

Tag detail:
```javascript
ml.classifiers.tags.detail(model_id, tag_id).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Edit tag:
```javascript
ml.classifiers.tags.edit(model_id, tag_id, {
    name: 'New tag name'
}).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Delete tag:
```javascript
ml.classifiers.tags.delete(model_id, tag_id).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```

### [Extractors](https://monkeylearn.com/api/v3/#extractor-detail)

List extractors:
```javascript
ml.extractors.list().then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Extractor detail:
```javascript
ml.extractors.detail(model_id).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

### [Workflows]()

Workflow detail:
```javascript
ml.workflows.detail(model_id).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Create new workflow:
```javascript
ml.workflows.create({
    name: 'My workflow',
    description: 'The workflow description',
    db_name: 'my_workflow',
    webhook_url: 'https://myurlwebhook.com/something/',
    steps: [{
        name: 'language',
        model_id: 'cl_Vay9jh28'
    }, {
        name: 'sentiment',
        model_id: 'cl_pi3C7JiL',
        conditions: [{
            target_step: 'language',
            column_name: 'tag_name',
            operator: 'includes',
            value: 'English-en'
        }]
    }]
}).then(response => {
    console.log(response.body)
}).catch(error => {
    console.log(error)
})
```

Delete workflow:
```javascript
ml.workflows.delete(model_id).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```

### [Workflow steps]()

Create workflow step:
```javascript
ml.workflows.steps.create(model_id, {
    name: 'keywords',
    model_id: 'ex_YCya9nrn'
}).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```


### [Workflow data]()

Create data:
```javascript
ml.workflows.data.create(model_id, [
    'Some text',
    {
        text: 'You can also send text inside an object like this'
    },
    {
        text: 'And include custom metadata',
        creation_date: '2018-07-07',  // this is a custom field
        rating: 1,  // this is a custom field
    }
]).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```

List data:
```javascript
ml.workflows.data.list(model_id).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```

### [Workflow custom fields]()

Create custom field:
```javascript
ml.workflows.custom_fields.create(model_id, {
    name: 'creation_date',
    type: 'date'
}).then(response => {
    console.log(response)
}).catch(error => {
    console.log(error)
})
```
