
var mongo = require('mongoskin');

if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
    var dbUrl = "mongodb://localhost:27017/uberlikedb";
}

var db = mongo.db(dbUrl);

module.exports = db;