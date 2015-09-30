var matchShare = function(){

	function get(matchObj,callback){
		db.collection("match_share").find(matchObj).toArray(callback);
	}

	function insert(matchObj,callback){
		var matchShare = {};
		matchShare = matchObj;
		db.collection("match_share").insert(matchObj,callback);
	}

	function update(conditionObj,matchObj,callback){
		db.collection("match_share").update(conditionObj,matchObj,callback);
	}

	function remove(matchObj,callback){
		db.collection("match_share").remove(matchObj,callback);
	}

	function getById(Id,callback){
		db.collection("match_share").findOne({"_id":Id},callback);
	}

	function getOne(matchObj,callback){
		db.collection("match_share").findOne(matchObj,callback);
	}

	function getRestrictFields(matchObj,fieldObj,callback){
		db.collection("match_share").find(matchObj,fieldObj).toArray(callback);
	}

	function getOneRestrictFields(matchObj,fieldObj,callback){
		db.collection("match_share").findOne(matchObj,fieldObj,callback);
	}

	return {
		get:get,
		insert:insert,
		update:update,
		remove:remove,
		getById:getById,
		getOne:getOne,
		getRestrictFields:getRestrictFields,
		getOneRestrictFields:getOneRestrictFields
	}
};
module.exports = matchShare;