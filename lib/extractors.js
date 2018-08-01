'use strict';

module.exports = Extractors;

const Models = require('./models');

function Extractors(ml) {
  Models.call(this, ml, `${ml.settings.base_url}extractors/`)
}

Extractors.prototype = Object.create(Models.prototype);
Extractors.prototype.constructor = Extractors;

Extractors.prototype.extract = Extractors.prototype.run;
