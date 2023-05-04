const { DateTime } = require('luxon');

const formatDate = (date) => DateTime.fromISO(date).toFormat("EEEE, MMMM d',' yyyy");

module.exports = {
  formatDate,
};
