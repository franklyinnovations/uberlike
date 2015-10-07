var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');
var moment = require('moment');

var emailUserModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	match_id:{type:String},
	share_id:{type:String}
});

var EmailUser = mongoose.model("EmailUser",emailUserModel);

module.exports=EmailUser;