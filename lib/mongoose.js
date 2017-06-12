var mongoose = require('mongoose');
var config = require('config');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, config.get('mongoose:options'));
//mongoose.connect("mongodb://localhost:27017/fotm", config.get('mongoose:options'));

module.exports = mongoose;