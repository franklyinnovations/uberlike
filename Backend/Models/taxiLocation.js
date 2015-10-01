var taxiLocation = function(){

	/*
	var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}
var db = mongo.db(dbUrl);
*/

	function get(taxiObj,callback){
		db.collection("taxi_location").find(taxiObj).toArray(callback);
	}

	function insert(taxiObj,callback){
		var taxiLocationObj = taxiObj;
		/*
		    taxiLocationObj._id = uuid.v4();
	 		taxiLocationObj.date_time = moment.utc().format(); // YYYY-MM-DDTHH:mm:ssZ
	 		taxiLocationObj.isOccupied = (taxiLocationObj.isOccupied)?taxiLocationObj.isOccupied:false;
	 		*/
	 		db.collection("taxi_location").insert(taxiLocationObj,callback);
	}

	function update(conditionObj,taxiObj,callback){
		db.collection("taxi_location").update(conditionObj,{"$set":taxiObj},callback);
	}

	function remove(taxiObj,callback){
		db.collection("taxi_location").remove(taxiObj,callback);
	}

	function getById(Id,callback){
		db.collection("taxi_location").findOne({"_id":Id},callback);
	}

	function getOne(taxiObj,callback){
		db.collection("taxi_location").findOne(taxiObj,callback);
	}

	return {
		get:get,
		insert:insert,
		update:update,
		remove:remove,
		getById:getById,
		getOne:getOne
	}
};
module.exports =  taxiLocation;