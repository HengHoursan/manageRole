const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = process.env.MONGO_URI;
db.user = require('./user.model');
db.product = require('./product.model');
db.productCategory = require('./productCategory.model');

module.exports = db;