var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send({"status":"error","msg":"I am from users"});
});
router.post('/setdefault/status',function(req,res,next){
	var data = req.body;
	if((data)&&(data.user_id)&&(data.loc_lat)&&(data.loc_lng)){
		if(data.occupied){
			data.occupied = 1;
		}else{
			data.occupied = 0;
		}
	data._id = uuid.v4();
	data.datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
	db.collection("drivers").insert(data,function(err,result){
		if(err){
			res.send({"status":"error","msg":"Error while inserting the user data"});
		}else{
			res.send({"status":"success","msg":"Status setting success","ddetails":data});
		}
	});
}else{
       res.send({"status":"error","msg":"One or more fields are missing"});
}
});
module.exports = router;