var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');

var Schema = mongoose.Schema;

var userModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	email:{type:String},
	username:{type:String},
	phonenumber:{type:String},
	provider_id:{type:String},
	image_url:{type:String},
	password:{type:String},
	confid:{type:String},
	confirm:{type:Boolean,default:false},
	enable:{type:Boolean,default:false},
	signupdate:{type:Date,default:moment.utc().format()},
	mconfirm:{type:Boolean,default:false},
	mconfid:{type:String},
	licenceId:{type:String},
	vnumber:{type:String},
	ctype:{type:String},
	usertype:{type:String,default:"P"}
});    

var User = mongoose.model("User",userModel);

module.exports = User;