module.exports = (function(){

var uuid = require('node-uuid');
var moment = require('moment');
var validator = require('validator');

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
	 //	setStatus:setStatus,
	 //	saveLocation:saveLocation,
	 	saveTaxiLocation:saveTaxiLocation
	 }
})();