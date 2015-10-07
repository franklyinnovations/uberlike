/*
var mongo = require('mongoskin');

if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
    var dbUrl = "mongodb://localhost:27017/uberlikedb";
}

var db = mongo.db(dbUrl);
*/
var mongoose = require('mongoose');

// mongodb://localhost:27017/uberlikedb

var db = mongoose.connect("mongodb://localhost/uberlikedb_test");

module.exports = db;