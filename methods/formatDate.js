const { DateTime } = require('luxon');

const formatDate = (date) => DateTime.fromJSDate(date).toFormat('EEEE, MMMM d, yyyy');

module.exports = {
  formatDate,
};
