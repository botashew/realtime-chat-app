const moment = require('moment')

function formatMessage(username, text){
    return {
        username,
        text,
        time: moment().locale('ru').format('LT')
    }
}

module.exports = formatMessage