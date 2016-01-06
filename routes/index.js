var User = require('models/user').User;
var HttpError = require('error').HttpError;

module.exports = function (app) {
    app.get('/partials/:filename', partials);
    app.get('/', require('./frontpage').get);

    app.post('/registration', require('./registration').post);
    app.post('/login', require('./login').post);
    app.post('/logout', require('./logout').post);
};

//Привязка partials для ejs (чтобы работал angular)
partials = function(req, res){
    var filename = req.params.filename;
    if(!filename) return;
    res.render("partials/" + filename );
};
