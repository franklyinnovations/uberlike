var user = function(){

	
		var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}
var db = mongo.db(dbUrl);


	function get(emailObj,callback){
		db.collection("email_user").find(emailObj).toArray(callback);
	}

	function getOne(emailObj,callback){
		db.collection("email_user").findOne(emailObj,callback);
	}

	function insert(emailObj,callback){
		var user = {};
		/*
		user._id = uuid.v4();
		user.email = userObj.email;
		user.enabled = false;
		user.username = userObj.username;
		*/
		user = emailObj;
		db.collection("email_user").insert(user,callback);
	}

	function update(conditionObj,updateObj,callback){
		db.collection("email_user").update(conditionObj,{"$set":updateObj},callback);
	}

	function remove(emailObj,callback){
		db.collection("email_user").remove(emailObj,callback);
	}

	function getById(Id,callback){
		db.collection("email_user").findOne({"_id":Id},callback);
	}

	function getRestricted(emailObj,fieldObj,callback){
		db.collection("email_user").find(emailObj,fieldObj).toArray(callback);
	}

	function getOneRestricted(userObj,fieldObj,callback){
		db.collection("email_user").findOne(userObj,fieldObj,callback);
	}

	return {
		get:get,
		insert:insert,
		update:update,
		remove:remove,
		getById:getById,
		getOne:getOne,
		getRestricted:getRestricted,
		getOneRestricted:getOneRestricted
	}
};
module.exports = user;