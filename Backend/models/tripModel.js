var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var User = require('./userModel');
var Schema = mongoose.Schema;

//created_time:{type:Date,default:moment.utc().format()},
//	split_amount:{type:Number},

var tripModel = new Schema({
	_id:{type:String,default:uuid.v4()},
	type:{type:String,default:"Trip"},
	user_id:{type:String,ref:"User"},
	startLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
	endLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
	start_address:{type:String},
	end_address:{type:String},
	trip_details:{type:String},
	start_time:{type:Date},
	car:{type:Number,default:0},
	Routes:[
	{
		type:{type:String,default:"Route"},
		Legs:[{
				type:{type:String,default:"Leg"},
				endLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
				startLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
				distance:{text:{type:String},value:{type:Number}},
				duration:{text:{type:String},value:{type:Number}},
				Steps:[
				{
					type:{type:String,default:"Step"},
				endLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
				startLocation:{type:{type:String,default:"Point"},coordinates:{type:Array}},
				distance:{text:{type:String},value:{type:Number}},
				duration:{text:{type:String},value:{type:Number}},
				geometry:{
					type:{type:String,default:"MultiLineString"},coordinates:Array
				}
				}
				]
			}]
	}]
});

tripModel.index({startLocation : '2dsphere'});

tripModel.index({endLocation : '2dsphere'});

var Trip = mongoose.model("Trip",tripModel);

module.exports= Trip;