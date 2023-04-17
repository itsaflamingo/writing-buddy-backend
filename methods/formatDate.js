const { DateTime } = require("luxon");

const formatDate = date => DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);

module.exports = {
    formatDate,
};