var moment = require('moment');

var generateMessage = (from, fromId, text) => {
  return {
    from,
    fromId,
    text,
    createdAt: moment().valueOf()
  }
}

module.exports = {generateMessage};
