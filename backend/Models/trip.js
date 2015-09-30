var trip = function(){

	function get(tripObj,callback){
		db.collection("trips").find(tripObj).toArray(callback);
	}

	function insert(tripObj,callback){
		var trip = {};
		trip = tripObj;
		db.collection("trips").insert(trip,callback);
	}

	function update(conditionObj,tripObj,callback){
		db.collection("trips").update(conditionObj,{"$set":tripObj},callback);
	}

	function remove(tripObj,callback){
		db.collection("trips").remove(tripObj,callback);
	}

	function getById(Id,callback){
		db.collection("trips").findOne({"_id":Id},callback);
	}

	function getOne(tripObj,callback){
		db.collection("trips").findOne(tripObj,callback);
	}

	return {
		get:get,
		insert:insert,
		update:update,
		remove:remove,
		getById:getById,
		getOne:getOne
	}
}
module.exports = trip;