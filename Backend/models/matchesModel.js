var mongoose = require('mongoose');
var uuid = require('node-uuid');
var Schema = mongoose.Schema;


var matcheModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	user_id:{type:String},
	trip_id:{type:String}
});

var Matche = mongoose.model("Matche",matcheModel);

module.exports= Matche;