var user = function(){

	/*
		var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}
var db = mongo.db(dbUrl);
*/

	function get(userObj,callback){
		db.collection("user").find(userObj).toArray(callback);
	}

	function getOne(userObj,callback){
		db.collection("user").findOne(userObj,callback);
	}

	function insert(userObj,callback){
		var user = {};
		/*
		user._id = uuid.v4();
		user.email = userObj.email;
		user.enabled = false;
		user.username = userObj.username;
		*/
		user = userObj;
		db.collection("user").insert(user,callback);
	}

	function update(conditionObj,updateObj,callback){
		db.collection("user").update(conditionObj,{"$set":updateObj},callback);
	}

	function remove(userObj,callback){
		db.collection("user").remove(userObj,callback);
	}

	function getById(Id,callback){
		db.collection("user").findOne({"_id":Id},callback);
	}

	function getOne(userObj,callback){
		db.collection("user").findOne(userObj,callback);
	}

	function getOneRestricted(userObj,fieldObj,callback){
		db.collection("user").findOne(userObj,fieldObj,callback);
	}

	return {
		get:get,
		insert:insert,
		update:update,
		remove:remove,
		getById:getById,
		getOne:getOne,
		getOneRestricted:getOneRestricted
	}
};
module.exports = user;