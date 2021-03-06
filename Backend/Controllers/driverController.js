 var driverController = function(){
var uuid = require('node-uuid');
var moment = require('moment');
var validator = require('validator');

var taxiLocationModel = require('../Models/taxiLocation')();

	 function saveTaxiLocation(req,res,next){
	 	var taxiLocationObj = req.body;
	 	if((taxiLocationObj)&&(taxiLocationObj.driver_id)&&(taxiLocationObj.location)){
	 		taxiLocationObj._id = uuid.v4();
	 		taxiLocationObj.date_time = moment.utc().format(); // YYYY-MM-DDTHH:mm:ssZ
	 		taxiLocationObj.isOccupied = (taxiLocationObj.isOccupied)?taxiLocationObj.isOccupied:false;
	 		taxiLocationModel.insert(taxiLocationObj,function(err,result){
	 			if(err){
	 				res.status(500);
	 				res.send({"status":"error","msg":"Error While inserting taxi location"});
	 			}else{
	 				res.status(200);
	 				res.send({"status":"success","taxiinfo":result,"msg":"Success Fully updated taxi location"});
	 			}
	 		});
	 	}else{
	 		res.status(400);
	 		res.send({"status":"error","msg":"some required information is missing"});
	 	}
	 }

	 return {
	 //	setStatus:setStatus,
	 //	saveLocation:saveLocation,
	 	saveTaxiLocation:saveTaxiLocation
	 }
};
module.exports = driverController;