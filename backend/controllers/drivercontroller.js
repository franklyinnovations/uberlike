module.exports = (function(){

var uuid = require('node-uuid');
var moment = require('moment');
var validator = require('validator');

	function setStatus(req,res,next){
	var driverInfo = req.body;
	if((driverInfo)&&(driverInfo.user_id)&&(driverInfo.loc_lat)&&(driverInfo.loc_lng)){
		if(driverInfo.occupied){
			driverInfo.occupied = 1;
		}else{
			driverInfo.occupied = 0;
		}
	driverInfo._id = uuid.v4();

	driverInfo.datetime = moment.utc().format(); // 'YYYY-MM-DD HH:mm:ssZ'

	db.collection("drivers").insert(driverInfo,function(err,result){
		if(err){
			res.send({"status":"error","msg":"Error while inserting the user."});
		}else{
			res.send({"status":"success","msg":"Status setting success","ddetails":driverInfo});
		}
	});
}else{
       res.send({"status":"error","msg":"One or more fields are missing"});
}
}
	 function saveLocation(req,res,next){
	 	var locationInfo = req.body;
	 	if((locationInfo)&&(locationInfo.location)&&(locationInfo.fulladdress)){
	 		db.collection("location").findOne({location:locationInfo.location},function(err,result){
	 			if(err){
	 				res.send({"status":"error","msg":"Error while getting user info"});
	 			}else if(result){
	 				res.send({"status":"success2","msg":"location already exists"});
	 			}else{
	 				locationInfo._id = uuid.v4();
	 				locationInfo.currenttime = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ssZ'
	 				db.collection("location").insert(locationInfo,function(err1,result1){
	 					if(err1){
	 						res.send({"status":"error","msg":"Error while inserting"});
	 					}else{
	 						res.send({"status":"success","data":locationInfo});
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
	 	if((taxiLocationObj)&&(taxiLocationObj.driver_id)&&(taxiLocationObj.location)){
	 		taxiLocationObj._id = uuid.v4();
	 		taxiLocationObj.date_time = moment.utc().format(); // YYYY-MM-DDTHH:mm:ssZ
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
	 	setStatus:setStatus,
	 	saveLocation:saveLocation,
	 	saveTaxiLocation:saveTaxiLocation
	 }

})();