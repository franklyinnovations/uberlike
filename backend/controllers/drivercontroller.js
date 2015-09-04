module.exports = (function(){

var uuid = require('node-uuid');
var moment = require('moment');

	function setstatus(req,res,next){
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
}
	 function savelocation(req,res,next){
	 	var data = req.body;
	 	if((data)&&(data.location)&&(data.fulladdress)){
	 		db.collection("location").findOne({location:data.location},function(err,result){
	 			if(err){
	 				res.send({"status":"error","msg":"Error while getting user info"});
	 			}else if(result){
	 				res.send({"status":"success2","msg":"location already exists"});
	 			}else{
	 				data._id = uuid.v4();
	 				data.currenttime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
	 				db.collection("location").insert(data,function(err1,result1){
	 					if(err1){
	 						res.send({"status":"error","msg":"Error while inserting"});
	 					}else{
	 						res.send({"status":"success","data":data});
	 					}
	 				});
	 			}
	 		});
	 	}else{
	 		res.send({"status":"error","msg":"One or more fields are missing"});
	 	}
	 }

	 function saveTaxiLocation(req,res,next){
	 	var taxiLocationObj = req.body;
	 	if((taxiLocationObj)&&(taxiLocationObj.driver_id)&&(taxiLocationObj.location_id)){
	 		taxiLocationObj._id = uuid.v4();
	 		taxiLocationObj.date_time = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
	 		taxiLocationObj.isOccupied = (taxiLocationObj.isOccupied)?taxiLocationObj.isOccupied:false;
	 		db.collection("taxi_location").insert(taxiLocationObj,function(err,result){
	 			if(err){
	 				res.send({"status":"error","msg":"Error While inserting taxi location"});
	 			}else{
	 				res.send({"status":"success","taxiinfo":result,"msg":"Success Fully updated taxi location"});
	 			}
	 		});
	 	}else{
	 		res.send({"status":"error","msg":"some required information is missing"});
	 	}
	 }

	 return {
	 	setstatus:setstatus,
	 	savelocation:savelocation,
	 	saveTaxiLocation:saveTaxiLocation
	 }

})();