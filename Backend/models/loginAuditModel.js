var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var Schema = mongoose.Schema;

var loginAuditModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	user_id:{type:String},
	location:{type:{type:String,default:"Point"},coordinates:{type:Array}},
	full_address:{type:String},
	datetime:{type:Date,default:moment.utc().format()}
});

var LoginAudit = mongoose.model("LoginAudit",loginAuditModel);

module.exports= LoginAudit;