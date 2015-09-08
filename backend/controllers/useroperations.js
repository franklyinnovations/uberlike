module.exports = (function(){

var uuid = require('node-uuid');
var md5 = require('md5');
var twilio = require('twilio');
var moment = require('moment');
var validator = require('validator');
var host = "http://localhost:3000";

	function controle(req,res,next){
		res.send({"It's":"OK"});
}

//Facebook or Google registered userhanling

function checkuserinfo(data,res){
	console.log("coming to userhandle.");
console.log(data);
var user = {};
if(data.provider=="google"){	
user.email = data.emails[0].value;
user.provider = "G"//data.provider||"google";
user.username = data.displayName;
user.provider_id = data.id;
//user.type = "P";
}else{
user.email = data.emails[0].value;
user.provider = "F";
user.username = data.name.givenName+" "+data.name.familyName;
user.provider_id = data.id;
//user.type="P";
}
user._id = uuid.v4();
user.password = "";
user.phonenumber = "";

db.collection("user").findOne({"email":user.email},function(err,result){
if(err){
	res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
	console.log(result);
	var phonenumber = result.phonenumber;
	//result = ;
	console.log("cookie setting-------from exisying accont");
	res.cookie('user', JSON.stringify(result));
	/*
	if(phonenumber){
		res.redirect('http://localhost/#/');
	}else{
		res.redirect('http://localhost/#/mobilenum');
	}
	*/
	res.redirect('/');
   // res.send({"status":"success","msg":"user login successfully","userdata":result});
}else{
	user.confid = uuid.v4();
	user.confirm = true;
	user.enable = false;
	user.signupdate = moment.utc().format(); //'YYYY-MM-DDTHH:mm:ss'
	var confirmid= user.confid;
	db.collection("user").insert(user,function(err1,result1){
		if(err1){
			res.send({"status":"error","msg":"error while inserting the user data"});
		}else{
		 	//user = JSON.stringify(user);
		 	console.log("cookie setting ---------from new account");
			res.cookie('user',JSON.stringify(user));
			res.redirect('/');
		//	res.send({"status":"success","msg":"user registered success fully","userdata":user});
		}
	});
	
}
});
}

// Inserting userinformation by registering

function insertuser(req,res,next){

var data = req.body;
console.log(data);
if(data.email && data.password && data.phonenumber){
	var phoneReg = new RegExp("^(0|\+91)?[789]\d{9}$");
	if(validator.isEmail(data.email)){
		if(!(validator.isNull(data.password))){
			//isLength(str, min
			if(validator.isLength(data.password,8)){

				if(phoneReg.test()){

			
	data.password = md5(data.password);
	if(data.usertype=="D"){
		console.log("driver registration");
	}else{
		data.usertype="P";
	}
	data._id = uuid.v4();
data.provider = "";
data.confid = uuid.v4();
data.confirm = false;
data.mconfid = Math.random().toString(36).substr(2,4);
data.mconfirm = false;
data.enable = false;
db.collection("user").findOne({$or:[{"email":data.email},{"phonenumber":data.phonenumber}]},function(err,result){
if(err){
res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
res.send({"status":"error","msg":"user email or phone number already exists"});
}else{
	data.signupdate = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
 db.collection("user").insert(data,function(err,result1){
     if(err){
     	res.send({"status":"error","msg":"failed to insert user information"});
     }else{
     	var confirmid = data.confid;
     	var passeddata={};
     	passeddata.username = data.username;
     //	passeddata.email = data.email;
     	passeddata.conformationlink = host+"/conf/user/"+confirmid;
     //	console.log(passeddata);
     	app.render("register-mail",passeddata,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var optionaldata = {};
     		optionaldata.email = data.email;
     		optionaldata.html = html;//"conform mail by click <a href="+passeddata.conformationlink+">here</a>";//html;
     		optionaldata.subject = "Registartion Conformation mail";

     		 email(optionaldata,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{

     		 	 //	
     		 	 var messagetext = "Please confirm your mobile number by entering :-"+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err,messageResult){
     		 	 	if(err){
     		 	 		console.log(err);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		delete data["password"];
     		 	 		res.send({"status":"success","msg":"user registration successfull!","data":data});
     		 	 	}
     		 	 });
     		 	}
     		 });
     	}
     	
     	});
     }
 });
}
});

	}else{
					res.send({"status":"error","msg":"Please enter valid Phone number"});
				}
			}else{
					res.send({"status":"error","msg":"password must be 8 characters or more"});
			}
		}else{
					res.send({"status":"error","msg":"Please enter password"});
		}
	}else{
					res.send({"status":"error","msg":"Please enter valid email"});
	}


}else{
	res.send({"status":"error","msg":"one or more fields are missing"});
}
}

//login registered user

function login(req,res,next){
var userinfo = req.body;
console.log(req.body);
if(userinfo.email && userinfo.password){
		if(validator.isEmail(data.email)){
		if(!(validator.isNull(data.password))){
			//isLength(str, min
			if(validator.isLength(data.password,8)){

	userinfo.password = md5(userinfo.password);
	//"provider":{"$ne":["F","G"]
db.collection("user").findOne({"email":userinfo.email,"password":userinfo.password},function(err,result){
if(err){
res.send({"status":"error","msg":"failed to get user data"});
}else if (result){
	delete result["password"];
	res.send({"status":"success","userdata":result});
}else{
res.send({"status":"error","msg":"username or password incorrect"});
}
});


}else{
					res.send({"status":"error","msg":"password must be 8 characters or more"});
			}
		}else{
					res.send({"status":"error","msg":"Please enter password"});
		}
	}else{
					res.send({"status":"error","msg":"Please enter valid email"});
	}

}else{
	res.send({"status":"error","msg":"one or more fields are missing"});
}
}

//forgotpassword recover by sending email

function forgotpassword(req,res,next){
var data = req.body;
console.log(data);
if(data.email){
	if(validator.isEmail(data.email)){
	db.collection("user").findOne({"email":data.email},function(err,result){
		if(err){
			res.send({"status":"error","msg":"error while getting the user information"});
		}else if(result){
			//send email to user
			console.log(result);
			var temppasswordset = {};
			temppasswordset.tpassword= uuid.v4();//Math.random().toString(36).substr(2,8);
			temppasswordset.exptime = moment.utc().add(4, 'hours').format(); // 'YYYY-MM-DDTHH:mm:ss'
			temppasswordset.preset = false;
			var forgotpassword = uuid.v4();
			var passeddata = {};
			passeddata.username = result.username;
			passeddata.plink = 'http://localhost/resetpwd/'+temppasswordset.tpassword;
			console.log(passeddata);
			app.render("passwordreset",passeddata,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var optionaldata = {};
     		optionaldata.email = result.email;
     		optionaldata.html = html;//"conform mail by click <a href="+passeddata.conformationlink+">here</a>";//html;
     		optionaldata.subject = "Reset password";

     		 email(optionaldata,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
  	db.collection("user").update({"_id":result._id},{"$set":temppasswordset},function(err1,result1){
  		if(err1){
  			res.send({"status":"error","msg":"Error while setting the user password resetting"});
  		}else{
  			res.send({"status":"success","msg":"Email send to "+data.email+" successfully."});
  		}
  	});
  //   		 		res.send({"status":"success","msg":"mail send successfully"});
     		 	}
     		 });
     		}
     	});
			
		}else{
			res.send({"status":"error","msg":"email does not exists."});
		}
	});
}else{
					res.send({"status":"error","msg":"Please enter valid email"});
	}
}else{
	res.send({"status":"error","msg":"user email is required"});
}
}

//email confirmation

function emailconfirmation(req,res,next){
var confid = req.params.confirmid || req.body.confirmId;;
if(confid){
db.collection("user").findOne({"confid":confid},function(err,result){
if(err){
res.send({"status":"error","msg":"error while confirm user data"});
}else if(result){
	if(result.confirm == true){
		res.send({"status":"success","msg":"user already confirmed."});
	}else{
		if(result.mconfirm){
			result.enable = true;
		}
db.collection("user").update({"_id":result._id},{"$set":{"confirm":true,"enable":result.enable}},function(err1,result1){
	if(err1){
		res.send({"status":"error","msg":"error while updating user confirmation"});
	}else{
		res.send({"status":"success","msg":"user email confirmation success"});
	}
});
}
}else{
 res.send({"status":"error","msg":"User does not exists"});
}
});
}else{
	res.send({"status":"error","msg":"Confirmation code is missing"});
}
}

//resetpage user forgot password

function resetpage(req,res,next){
var tlink = req.params.tpassword;
if(tlink){
var settime = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
db.collection("user").findOne({"tpassword":tlink},function(err,result){
	console.log(result);
if(err){
res.send({"status":"error","msg":"error while getting the user data"});
}else if((result)&&(settime <= result.exptime )&&(!result.preset)){
res.render('reset-pwd',result);
}else{
	res.send({"status":"error","msg":"Link expired or Does not exists."});
}
});
}else{
	res.send({"status":"error","msg":"Please enter valid url"});
}
}

// reset password user updates newpassword

function resetpasswd(req,res,next){
var data = req.body;
console.log(data);
if(data._id&&data.password){

if(!(validator.isNull(data.password))){
			//isLength(str, min
			if(validator.isLength(data.password,8)){

db.collection("user").findOne({"_id":data._id},function(err,result){
	if(err){
		res.send({"status":"error","msg":"Error while getting user information."});
	}else if(result){
		db.collection("user").update({"_id":result._id},{"$set":{"password":md5(data.password),"preset":true}},function(err1,result1){
			if(err1){
				res.send({"status":"error","msg":"Error while setting the user password."});
			}else{
				res.send({"status":"success","msg":"Password resetting successfullY!"});
			}
		});
	}else{
		res.send({"status":"error","msg":"user doesnot exists."});
	}
});
}else{
					res.send({"status":"error","msg":"password must be 8 characters or more"});
			}
		}else{
					res.send({"status":"error","msg":"Please enter password"});
		}

}else{
	res.send({"status":"error","msg":"Some user info is missing."});
}
}

//verify mobile number

function verifymobile(req,res,next){
	var data = req.body;
	console.log(data);
	if(!(validator.isNull(data.mconfirm))){

	db.collection("user").findOne({"_id":data._id},function(err,result){
		if(err){
			res.send({"status":"error","msg":"error while getting userinfo"});
		}else if(result){
			if(!(result.mconfirm)){
				if(result.mconfid == data.mconfid){
					if(result.confirm){
						result.enable = true;
					}
				db.collection("user").update({"_id":result._id},{"$set":{"mconfirm":true,"enable":result.enable}},function(err1,result1){
					if(err1){
						res.send({"status":"error","msg":"failed to confirm password."});
					}else{
						res.send({"status":"success","msg":"Mobile number verified successfullY"});
					}
				});
				}else{
					res.send({"status":"error","msg":"Please enter correct verificationcode."});
				}
			}else{
				//res.send({"status":"success","msg":"......."});
				res.send({"status":"error","msg":"user already confirmed his mobile number"});
			}
		}else{
			console.log(result);
			res.send({"status":"error","msg":"user does not exists."});
		}
	});

	}else{
		res.send({"status":"error","msg":"Please enter confirmation code"});
	}

}

//updating passenger mobile number

function updatemobilenum(req,res,next){
	var data = req.body;
	if(data.phonenumber){
		var phoneReg = new RegExp("^(0|\+91)?[789]\d{9}$");
		if(phoneReg.test()){
		var usertype = data.usertype;
		data.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":data.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":data._id},{"$set":{"phonenumber":data.phonenumber,"mconfirm":false,"mconfid":data.mconfid,"usertype":usertype}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err2,messageResult){
     		 	 	if(err2){
     		 	 		console.log(err2);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.send({"status":"success","msg":"MobileNumber updated successfully."});
     		 	 	}
     		 	 });
						}
					});
				}
			}
		})
}else{
			res.send({"status":"error","msg":"Please enter valid phone number"});
		}
	}else{
		res.send({"status":"error","msg":"please enter mobilenumber"});
	}
}

// confirmation message resending

function mesgsend(req,res,next){
	var data = req.body;
	if(data._id){
db.collection("user").findOne({"_id":data._id},function(err,result1){
	if(err){
		res.send({"status":"error","msg":"error while getting userinfo"});
	}else if(result1){
		if(!(result1.mconfirm)){
			var newobj={};
newobj.mconfid = Math.random().toString(36).substr(2,4);
newobj.mconfirm = false;
db.collection("user").update({"_id":result._id},{"$set":newobj},function(err1,result2){
					if(err1){
						res.send({"status":"error","msg":"failed to set new code"});
					}else{
						 var messagetext = "Please confirm your mobile number by entering "+newobj.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = result1.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err,messageResult){
     		 	 	if(err){
     		 	 		console.log(err);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.send({"status":"success","msg":"message send successfully"});
     		 	 	}
     		 	 });
					}
				});
		}else{
			res.send({"status":"error","msg":"user already confirmed his mobile number."});
		}
	}else{
		res.send({"status":"error","msg":"user doesnot exists."});
	}
});

}else{
	res.send({"status":"error","msg":"user id is missing"});
    //res.send({"status":"success","msg":"mobile number send successfully"});
}
}

// updating driver info when he register with Facebook or Gmail

function driverdetails(req,res,next){
	var data = req.body;
	if(data.phonenumber&&data.licenceId&&data.vnumber&&data.ctype){
		var usertype = data.usertype;
		var phoneReg = new RegExp("^(0|\+91)?[789]\d{9}$");
		if(phoneReg.test()){
		data.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":data.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":data._id},{"$set":{"phonenumber":data.phonenumber,"mconfirm":false,"mconfid":data.mconfid,"licenceId":data.licenceId,"vnumber":data.vnumber,"ctype":data.ctype,"usertype":usertype}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err2,messageResult){
     		 	 	if(err2){
     		 	 		console.log(err2);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.send({"status":"success","msg":"Driver details updated successfully.Please confirm your mobile number"});
     		 	 	}
     		 	 });
						}
					});
				}
			}
		})
}else{
			res.send({"status":"error","msg":"user already confirmed his mobile number."});
		}
	}else{
		res.send({"status":"error","msg":"driver licenceid or vehicle number or vehicle type or mobile number is missing"});
	}
}

//confirmation mail resending

function confirmemail(req,res,next){
var data = req.body;
if(data._id){
db.collection("user").findOne({"_id":data._id},function(err,result1){
	if(err){
		res.send({"status":"error","msg":"error while getting userinfo"});
	}else if(result1){
		if(!(result1.confirm)){
		var passeddata={};
     	passeddata.username = result1.username;
     	var confirmid = result1.confid;
     //	passeddata.email = data.email;
     	passeddata.conformationlink = host+"/conf/user/"+confirmid;
     //	console.log(passeddata);
     	app.render("register-mail",passeddata,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var optionaldata = {};
     		optionaldata.email = result1.email;
     		optionaldata.html = html;//"conform mail by click <a href="+passeddata.conformationlink+">here</a>";//html;
     		optionaldata.subject = "You missed last time.Registartion Conformation mail";

     		 email(optionaldata,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
     		 		res.send({"status":"success","msg":"mail send successfully"});
     		 	}
     		 });
     		}
     	});
     }else{
     	res.send({"status":"error","msg":"user already confirmed his email address."});
     }
	}else{
		res.send({"status":"error","msg":"user does not exists."});
	}
});
}else{
	res.send({"status":"error","msg":"user id is missing"});
    //res.send({"status":"success","msg":"mobile number send successfully"});
}

}

// Save Login Audit

function loginAuditInsert(req,res,next){
var loginAuditInfo = req.body;
console.log(loginAuditInfo);
if((loginAuditInfo.user_id)&&(loginAuditInfo.location_id)){
	loginAuditInfo._id = uuid.v4();
loginAuditInfo.datetime = moment.utc().format();// 'YYYY-MM-DDTHH:mm:ss'
db.collection("login_audit").insert(loginAuditInfo,function(err,result){
if(err){
res.send({"status":"error","msg":"Login info storing failed."});
}else{
res.send({"status":"success","msg":"Record updated successfully."});
}
});
}else{
	res.send({"status":"error","msg":"userid or location id fields are missing"});
}
}

return {
 checkuserinfo:checkuserinfo,
 controle:controle,
 insertuser:insertuser,
 login:login,
 forgotpassword:forgotpassword,
 emailconfirmation:emailconfirmation,
 resetpage:resetpage,
 confirmemail:confirmemail,
 resetpasswd:resetpasswd,
 verifymobile:verifymobile,
 driverdetails:driverdetails,
 updatemobilenum:updatemobilenum,
 mesgsend:mesgsend,
 loginAuditInsert:loginAuditInsert
}

})();