var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var http = require('http');
var path = require('path');
var config = require('config');

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
            console.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }

});

//Deploy
if(process.env.NODE_ENV==="production"){
    var server = http.createServer(app);
    server.listen(process.env.PORT, process.env.IP || '0.0.0.0', function () {
        console.log('Express server listening on port ' + process.env.PORT);
    });
}
//local
else {
    var server = http.createServer(app);
    server.listen(3000, 'localhost', function () {
        console.log('Express server listening on port ' + 3000);
    });
}

var io = require('socket')(server);
require('socket/userEvents')(io);
require('socket/teamEvents')(io);
require('socket/characterEvents')(io);
require('socket/cityEvents')(io);
require('socket/battleEvents')(io);
app.set('io', io);