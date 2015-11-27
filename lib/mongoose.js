var mongoose = require('mongoose');
var config = require('config');
mongoose.connect(process.env.MONGOLAB_URI, config.get('mongoose:options'));

module.exports = mongoose;