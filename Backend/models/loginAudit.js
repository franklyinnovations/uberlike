var loginAudit = function(){

	
	/*
	var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}
var db = mongo.db(dbUrl);
*/


	function get(loginAuditObj,callback){
		db.collection("login_audit").find(loginAuditObj).toArray(callback);
	}

	function insert(loginAuditObj,callback){
		var loginAuditDetailsObj = {};
		loginAuditDetailsObj = loginAuditObj;
		db.collection("login_audit").insert(loginAuditDetailsObj,callback);
	}

	function update(conditionObj,loginAuditObj,callback){
		db.collection("login_audit").update(conditionObj,{"$set":loginAuditObj},callback);
	}

	function remove(loginAuditObj,callback){
		db.collection("login_audit").remove(loginAuditObj,callback);
	}

	function getById(Id,callback){
		db.collection("login_audit").findOne({"_id":Id},callback);
	}

	function getOne(loginAuditObj,callback){
		db.collection("login_audit").findOne(loginAuditObj,callback);
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
module.exports = loginAudit;