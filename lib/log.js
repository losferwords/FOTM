var winston = require('winston');

var getLogger = function(module){
    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: 'debug',
                prettyPrint: true,
                colorize: true,
                silent: false,
                timestamp: false,
                showLevel: false
            })
        ]
    });
};

module.exports = getLogger;