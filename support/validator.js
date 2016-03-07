var moment = require('moment');

function isValidDate(dateString) {
  return moment(dateString, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true).isValid()
}

function isEmptyOrDate(dateString) {
  return dateString === undefined || isValidDate(dateString);
}

module.exports = {
  isValidDate: isValidDate,
  isEmptyOrDate: isEmptyOrDate
};