var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var http = require('http');
var path = require('path');
var config = require('config');
var log = require('lib/log')(module);

var mongoose = require('lib/mongoose');
var HttpError = require('error').HttpError;
var errorHandler = require('express-error-handler');

var app = express();

app.engine('ejs', require('ejs-mate'));
app.set('views', __dirname + path.sep + 'template');
app.set('view engine', 'ejs');

app.use(require('serve-favicon')(__dirname + '/public/images/favicon.ico'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(config.get('session:secret')));

app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    resave: false,
    cookie: config.get('session:cookie'),
    store: require('lib/sessionStore'),
    saveUninitialized: false
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

// роуты приложения
require('routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan("dev"));

app.use(function(req, res) {
    res.redirect('/');
});

//<editor-fold desc="обработчик ошибок">
app.use(function (err, req, res, next) {

    if (typeof err == 'number') {
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            errorHandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }

});
//</editor-fold>

//<editor-fold desc="запуск сервера">
var server = http.createServer(app);
server.listen(config.get('port'), '192.168.0.114', function () {
    log.info('Express server listening on port ' + config.get('port'));
});
//</editor-fold>

var io = require('socket')(server);
app.set('io', io);