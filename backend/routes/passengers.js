var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var router = express.Router();
//console.log(moment().format('YYYY-MM-DD'));
router.get('/', function(req, res, next) {
    res.send({"status":"error","msg":"I am from users"});
});
router.post('/search/destination',function(req,res,next){
	var data = req.body;
	if((data)&&(data.user_id)&&(data.present_lat)&&(data.present_lng)&&(data.dest_lat)&&(data.dest_lng)&&(data.time)){
		data._id = uuid.v4();
		data.date = moment().format('YYYY-MM-DD'); // HH:mm:ss
		db.collection("passengers").insert(data,function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while inserting user data"});
			}else{
				res.send({"status":"success","msg":"Successfully updated the searching details","passenger":data});
			}
		});
	}else{
		res.send({"status":"error","msg":"Missing some userinfo"});
	}
});
module.exports = router;