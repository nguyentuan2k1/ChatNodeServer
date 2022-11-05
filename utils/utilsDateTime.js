var date = new Date(Date.now());
var userTimezoneOffset = date.getTimezoneOffset() * 60000;
exports.getDateTime = new Date(date.getTime() - userTimezoneOffset);
