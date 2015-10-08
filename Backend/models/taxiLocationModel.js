var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var Schema = mongoose.Schema;

var taxiLocationModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	driver_id:{type:String},
	location:{type:{type:String,default:"Point"},coordinates:Array},
	isOccupied:{type:Boolean,default:false},
	full_address:{type:String},
	date_time:{type:Date,default:moment.utc().format()}
});

taxiLocationModel.index({location : '2dsphere'});

var TaxiLocation = mongoose.model("TaxiLocation",taxiLocationModel);

module.exports= TaxiLocation;