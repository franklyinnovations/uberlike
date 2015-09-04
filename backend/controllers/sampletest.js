module.exports = (function(){
	router.post('/create',function(req,res,next){
	var data = req.body;
	data._id=uuid.v4();
	db.collection("user").insert(data,function(err,result){
		if(err){
			res.send({"err":"Error while getting the user data"});
		}else{
			res.send({"success":"user created successfully"});
		}
	});
});
router.post('/login',function(req,res,next){
	var data = req.body;
	db.collection("user").findOne({"email":data.email,"password":data.password},function(err,result){
		if(err){
			res.send({"err":"Error while getting the user data"});
		}else{
			if(result){
				res.send({"err":"user not existed"});
			}else{
				res.send({"success":"user login successfully","data":result});
			}
		}
	});
});
router.post('/update',function(req,res,next){
	var data = req.body;
	var _id = data.id;
	delete data['id'];
	db.collection("user").update({"_id":_id},data,function(err,result){
		if(err){
			res.send({"err":"Error while updating the user data"});
		}else{
			res.send({"success":"user updated successfully","data":result});
		}
	});
});
router.get('/delete/:_id',function(req,res,next){
	var _id = req.params._id;
	db.collection("user").remove({"_id":_id},function(err,result){
		if(err){
			res.send({"err":"Error while removing the user data"});
		}else{
			res.send({"success":"user removed successfully"});
		}
	});
});
router.get('/all',function(req,res,next){
	console.log("coming here----------------");
	db.collection("user").find({}).toArray(function(err,result){
		if(err){
			console.log("error----------");
			res.send({"err":"Error while getting all user data"});
		}else{
			console.log(result);
			res.send({"success":"user data get success fully","data":result});
		}
	});
});
})();