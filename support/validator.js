var expressValidator = require('express-validator');
var moment = require('moment');

function isValidDate(param, format) {
  return moment(param, format, true).isValid()
}

function normalizeErrors(validationErrors) {
  return validationErrors.map(e => ({
    code: 'invalid.param.' + e.param,
    message: e.msg, value:e.value
  }));
}

var validatorOptions = {
  customValidators: {
    isValidDate: isValidDate
  }
};

module.exports = {
  normalizeErrors: normalizeErrors,
  middleware: expressValidator(validatorOptions)
};