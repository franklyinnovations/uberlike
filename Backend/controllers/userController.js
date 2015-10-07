var userController = function(){
	/*
	var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}

var db = mongo.db(dbUrl);
*/

var uuid = require('node-uuid');
var twilio = require('twilio');
var moment = require('moment');
var validator = require('validator');
var fs = require('fs');
var request = require('request');
var bcrypt = require('bcrypt-node');


// var userModel = require('../models/user')();
// var loginAuditModel = require('../models/loginAudit')();

var User = require('../models/userModel');
var LoginAudit = require('../models/loginAuditModel');

var host = "http://localhost:3000";


 var controle = function (req,res,next){
		res.send({"It's":"OK"});
}

var errorMsg = {
	obj:"Error in user operation",
	property:'default user',
	errormsg:'default error message'
}

// //"node ./bin/www"

//Facebook or Google registered userhanling

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    console.log(__dirname);
    request(uri).pipe(fs.createWriteStream("public/images/"+filename)).on('close', callback);
  });
};

var oauthLoginHandler =function (data,res){
	console.log("coming to userhandle.");
console.log(data);
// user.email = data.emails[0].value;

var user = new User();
user.email = data.emails[0].value;


User.findOne({email:user.email},function(err,result){
if(err){
	res.status(500);
	res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
	console.log(result);
	var phonenumber = result.phonenumber;
	//result = ;
	if(data.provider=="google"){
		user.image_url = result._id+'.jpg';
	var image_base = data.photos[0].value // data.image.url;
	}else{
	user.image_url = result._id+'.jpg';
	var image_base = data.photos[0].value;
	}
	console.log("cookie setting-------from existing accont");

	download(image_base,user.image_url,function(){
	console.log("Successfully downloaded provider image");
});
	res.cookie('user', JSON.stringify(result));
	res.redirect('/');
}else{
	user._id = uuid.v4();
	if(data.provider=="google"){	

user.provider = "G"//data.provider||"google";
user.username = data.displayName;
user.provider_id = data.id;
user.image_url = user._id+'.jpg';
var image_base = data.photos[0].value;
}else{
user.provider = "F";
user.username = data.name.givenName+" "+data.name.familyName;
user.provider_id = data.id;
user.image_url = user._id+'.jpg';
var image_base = data.photos[0].value;
}
download(image_base,user.image_url,function(){
	console.log("Successfully downloaded provider image");
});
user.password = "";
user.phonenumber = "";
user.gender = data.gender;
	user.confid = uuid.v4();
	user.confirm = true;
	user.enable = false;
	user.signupdate = moment.utc().format(); //'YYYY-MM-DDTHH:mm:ss'
	var confirmid= user.confid;
	user.save(function(err1,result1){
		if(err1){
			res.status(500);
			res.send({"status":"error","msg":"error while inserting the user data"});
		}else{
		 	console.log("cookie setting ---------from new account");
			res.cookie('user',JSON.stringify(user));
			res.redirect('/');
		}
	});
}
});
}

// Inserting userinformation by registering

var insertUsers = function(req,res,next){

var userData = new User(req.body);
console.log(userData);
if(userData.email && userData.password && userData.phonenumber){
	//    ^(0|\+91)?[789]\d{9}$
	var phoneReg = new RegExp("^[7-9][0-9]{9}$");
	if(validator.isEmail(userData.email)){
		if(!(validator.isNull(userData.password))){
			//isLength(str, min
			if(validator.isLength(userData.password,8)){

				if(phoneReg.test(userData.phonenumber)){

			
	userData.password = bcrypt.hashSync(userData.password);
	if(userData.usertype=="D"){
		console.log("driver registration");
	}else{
		userData.usertype="P";
	}
	userData._id = uuid.v4();
userData.provider = "";
userData.confid = uuid.v4();
userData.confirm = false;
userData.mconfid = Math.random().toString(36).substr(2,4);
userData.mconfirm = false;
userData.enable = false;
User.findOne({$or:[{"email":userData.email},{"phonenumber":userData.phonenumber}]},function(err,result){
if(err){
	res.status(500);
res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
	res.status(409);
res.send({"status":"error","msg":"user email or phone number already exists"});
}else{
	userData.image_url = userData._id+'.jpg';
	download("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Crystal_Clear_kdm_user_male.png/50px-Crystal_Clear_kdm_user_male.png",userData.image_url,function(){
		console.log('image downloaded successfully');
	});
	userData.gender = userData.gender || 'male';
	userData.signupdate = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
    userData.save(function(err,result1){
     if(err){
     	res.status(500);
     	res.send({"status":"error","err":err,"msg":"failed to insert user information"});
     }else{
     	var confirmid = userData.confid;
     	var emilValues={};
     	emilValues.username = userData.username;
     //	emilValues.email = data.email;
     	emilValues.conformationlink = host+"/conf/user/"+confirmid;
     //	console.log(emilValues);
     	app.render("register-mail",emilValues,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.status(500);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailDetails = {};
     		emailDetails.email = userData.email;
     		emailDetails.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailDetails.subject = "Registartion Conformation mail";

     		 email(emailDetails,function(err,success){
     		 	if(err){
     		 		res.status(500);
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{

     		 	 //	
     		 	 var messagetext = "Please confirm your mobile number by entering :-"+userData.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = userData.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err,messageResult){
     		 	 	if(err){
     		 	 		console.log(err);
     		 	 		res.status(500);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		delete userData["password"];
     		 	 		res.status(201);
     		 	 		res.send({"status":"success","msg":"user registration successfull!","data":userData});
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
		errorMsg.obj = "user inserting";
	errorMsg.property='phonenumber';
	errorMsg.errormsg='Invalid phone number';
	res.status(400);
					res.send({"status":"error","msg":"Please enter valid Phone number","errorobj":errorMsg});
				}
			}else{
				errorMsg.obj = "user inserting";
	errorMsg.property='Password';
	errorMsg.errormsg='Password must be 8 characters';
	res.status(400);
					res.send({"status":"error","msg":"password must be 8 characters or more","errorobj":errorMsg});
			}
		}else{
			errorMsg.obj = "user inserting";
	errorMsg.property='Password';
	errorMsg.errormsg='Please enter password';
	res.status(400);
					res.send({"status":"error","msg":"Please enter password","errorobj":errorMsg});
		}
	}else{
		errorMsg.obj = "user inserting";
	errorMsg.property='email address';
	errorMsg.errormsg='Invalid Email.';
	res.status(400);
					res.send({"status":"error","msg":"Please enter valid email","errorobj":errorMsg});
	}


}else{
	res.status(400);
	res.send({"status":"error","msg":"one or more fields are missing"});
}
}

//login registered user

function login(req,res,next){
var userinfo = req.body;
console.log(req.body);
if(userinfo.email && userinfo.password){
		if(validator.isEmail(userinfo.email)){
		if(!(validator.isNull(userinfo.password))){
			//isLength(str, min
			if(validator.isLength(userinfo.password,8)){

 //	userinfo.password = bcrypt.hashSync(userinfo.password);
	//"provider":{"$ne":["F","G"]
	// ,"password":userinfo.password
	User.findOne({"email":userinfo.email},function(err,result){
	 //	console.log(userinfo.password);
	 //	console.log(result.password);
		console.log(bcrypt.compareSync(userinfo.password,result.password));
if(err){
	res.status(500);
res.send({"status":"error","msg":"failed to get user data"});
}else if ((result)&&(bcrypt.compareSync(userinfo.password,result.password))){
	delete result["password"];
	res.status(200);
	res.send({"status":"success","userdata":result});
}else{
	res.status(401);
res.send({"status":"error","msg":"username or password incorrect"});
}
});
}else{
	errorMsg.obj = "user login";
	errorMsg.property='password';
	errorMsg.errormsg='Password must be 8 characters';
	res.status(400);
					res.send({"status":"error","msg":"password must be 8 characters or more","errorobj":errorMsg});
			}
		}else{
			errorMsg.obj = "user Login";
	errorMsg.property='password';
	errorMsg.errormsg='Please enter password.';
					res.status(400);
					res.send({"status":"error","msg":"Please enter password","errorobj":errorMsg});
		}
	}else{
		errorMsg.obj = "user Login";
	errorMsg.property='email';
	errorMsg.errormsg='Please enter valid Email.';
					res.status(400);
					res.send({"status":"error","msg":"Please enter valid email","errorobj":errorMsg});
	}

}else{
	res.status(400);
	res.send({"status":"error","msg":"one or more fields are missing"});
}
}

//forgotpassword recover by sending email

function forgotPassword(req,res,next){
var userInfo = req.body;
console.log(userInfo);
if(userInfo.email){
	if(validator.isEmail(userInfo.email)){
	User.findOne({"email":userInfo.email},function(err,result){
		if(err){
			res.status(500);
			res.send({"status":"error","msg":"error while getting the user information"});
		}else if(result){
			//send email to user
			console.log(result);
			var temppasswordset = {};
			temppasswordset.tpassword= uuid.v4();//Math.random().toString(36).substr(2,8);
			temppasswordset.exptime = moment.utc().add(4, 'hours').format(); // 'YYYY-MM-DDTHH:mm:ss'
			temppasswordset.preset = false;
			var forgotpassword = uuid.v4();
			var emilValues = {};
			emilValues.username = result.username;
			emilValues.plink = host+'/resetpwd/'+temppasswordset.tpassword;
			console.log(emilValues);
			app.render("passwordreset",emilValues,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.status(500);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailObj = {};
     		emailObj.email = result.email;
     		emailObj.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailObj.subject = "Reset password";

     		 email(emailObj,function(err,success){
     		 	if(err){
     		 		res.status(500);
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
  	        User.update({"_id":result._id},temppasswordset,function(err1,result1){
  		if(err1){
  			res.status(500);
  			res.send({"status":"error","msg":"Error while setting the user password resetting"});
  		}else{
  			res.status(200);
  			res.send({"status":"success","msg":"Email send to "+userInfo.email+" successfully."});
  		}
  	});
     		 	}
     		 });
     		}
     	});
		}else{
			res.status(404);
			res.send({"status":"error","msg":"email does not exists."});
		}
	});
}else{
					res.status(400);
					res.send({"status":"error","msg":"Please enter valid email"});
	}
}else{
	res.status(400);
	res.send({"status":"error","msg":"user email is required"});
}
}

//email confirmation

function emailConfirmation(req,res,next){
var confid = req.params.confirmid || req.body.confirmId;
if(confid){
	 User.findOne({"confid":confid},function(err,result){
if(err){
	res.status(500);
res.send({"status":"error","msg":"error while confirm user data"});
}else if(result){
	if(result.confirm == true){
		res.status(409);
		res.send({"status":"success","msg":"user already confirmed."});
	}else{
		if(result.mconfirm){
			result.enable = true;
		}
   User.update({"_id":result._id},{"confirm":true,"enable":result.enable},function(err1,result1){
	if(err1){
		res.status(500);
		res.send({"status":"error","msg":"error while updating user confirmation"});
	}else{
		res.status(200);
		res.send({"status":"success","msg":"user email confirmation success"});
	}
});
}
}else{
	res.status(404);
 res.send({"status":"error","msg":"User does not exists"});
}
});
}else{
	res.status(400);
	res.send({"status":"error","msg":"Confirmation code is missing"});
}
}

//resetpage user forgot password

function resetPage(req,res,next){
var tlink = req.params.tpassword;
if(tlink){
var settime = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
   User.findOne({"tpassword":tlink},function(err,result){
	console.log(result);
if(err){
	res.status(500);
res.send({"status":"error","msg":"error while getting the user data"});
}else if((result)&&(settime <= result.exptime )&&(!result.preset)){
	res.status(200);
res.render('reset-pwd',result);
}else{
	res.status(404);
	res.send({"status":"error","msg":"Link expired or Does not exists."});
}
});
}else{
	res.status(404);
	res.send({"status":"error","msg":"Please enter valid url"});
}
}

// reset password user updates newpassword

function resetPasswd(req,res,next){
var resetData = req.body;
console.log(resetData);
if(resetData._id&&resetData.password){

if(!(validator.isNull(resetData.password))){
			//isLength(str, min
			if(validator.isLength(resetData.password,8)){

 User.findOne({"_id":resetData._id},function(err,result){
	if(err){
		res.status(500);
		res.send({"status":"error","msg":"Error while getting user information."});
	}else if(result){
	   User.update({"_id":result._id},{"password":bcrypt.hashSync(resetData.password),"preset":true},function(err1,result1){
			if(err1){
				res.status(500);
				res.send({"status":"error","msg":"Error while setting the user password."});
			}else{
				res.status(200);
				res.send({"status":"success","msg":"Password resetting successfullY!"});
			}
		});
	}else{
		res.status(404);
		res.send({"status":"error","msg":"user doesnot exists."});
	}
});
}else{
					res.status(400);
					res.send({"status":"error","msg":"password must be 8 characters or more"});
			}
		}else{
					res.status(400);
					res.send({"status":"error","msg":"Please enter password"});
		}

}else{
	res.status(400);
	res.send({"status":"error","msg":"Some user info is missing."});
}
}

//verify mobile number

function verifyMobileNumber(req,res,next){
	var userData = req.body;
	console.log(userData);
	if((userData._id)&&!(validator.isNull(userData.mconfid))){

	 User.findOne({"_id":userData._id},function(err,result){
		if(err){
			res.status(500);
			res.send({"status":"error","msg":"error while getting userinfo"});
		}else if(result){
			if(!(result.mconfirm)){
				if(result.mconfid == userData.mconfid){
					if(result.confirm){
						result.enable = true;
					}
				     User.update({"_id":result._id},{"mconfirm":true,"enable":result.enable},function(err1,result1){
					if(err1){
						res.status(500);
						res.send({"status":"error","msg":"failed to confirm password."});
					}else{
						res.status(200);
						res.send({"status":"success","msg":"Mobile number verified successfullY"});
					}
				});
				}else{
					res.status(422);
					res.send({"status":"error","msg":"Please enter correct verificationcode."});
				}
			}else{
				//res.send({"status":"success","msg":"......."});
				res.status(409);
				res.send({"status":"error","msg":"user already confirmed his mobile number"});
			}
		}else{
			console.log(result);
			res.status(404);
			res.send({"status":"error","msg":"user does not exists."});
		}
	});

	}else{
		res.status(400);
		res.send({"status":"error","msg":"Please enter confirmation code"});
	}
}

//updating passenger mobile number

function updateMobileNumber(req,res,next){
	var userData = req.body;
	if((userData._id) && (userData.phonenumber)){
		//^(0|\+91)?[789]\d{9}$
		var phoneReg = new RegExp("^[7-9][0-9]{9}$"); 
		if(phoneReg.test(userData.phonenumber)){
		var usertype = userData.usertype || "P";
		userData.mconfid = Math.random().toString(36).substr(2,4);
	     User.findOne({"phonenumber":userData.phonenumber},function(err,result){
			if(err){
				res.status(500);
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				console.log(result._id);
				if((result)&&(userData._id != result._id)){
					res.status(409);
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					 User.update({"_id":userData._id},{"phonenumber":userData.phonenumber,"mconfirm":false,"mconfid":userData.mconfid,"usertype":usertype},function(err1,result1){
						if(err1){
							res.status(500);
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+userData.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = userData.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err2,messageResult){
     		 	 	if(err2){
     		 	 		console.log(err2);
     		 	 		res.status(500);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.status(200);
     		 	 		res.send({"status":"success","msg":"MobileNumber updated successfully."});
     		 	 	}
     		 	 });
						}
					});
				}
			}
		})
}else{
			res.status(400);
			res.send({"status":"error","msg":"Please enter valid phone number"});
		}
	}else{
		res.status(400);
		res.send({"status":"error","msg":"please enter mobilenumber"});
	}
}

// confirmation message resending

function resendMobileConfCode(req,res,next){
	var userData = req.body;
	if(userData._id){
   User.findOne({"_id":userData._id},function(err,result1){
	if(err){
		res.status(500);
		res.send({"status":"error","msg":"error while getting userinfo"});
	}else if(result1){
		if(!(result1.mconfirm)){
			var newobj={};
newobj.mconfid = Math.random().toString(36).substr(2,4);
newobj.mconfirm = false;
         User.update({"_id":result._id},newobj,function(err1,result2){
					if(err1){
						res.status(500);
						res.send({"status":"error","msg":"failed to set new code"});
					}else{
						 var messagetext = "Please confirm your mobile number by entering "+newobj.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = result1.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err,messageResult){
     		 	 	if(err){
     		 	 		console.log(err);
     		 	 		res.status(500);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.status(200);
     		 	 		res.send({"status":"success","msg":"message send successfully"});
     		 	 	}
     		 	 });
					}
				});
		}else{
			res.status(409);
			res.send({"status":"error","msg":"user already confirmed his mobile number."});
		}
	}else{
		res.status(404);
		res.send({"status":"error","msg":"user doesnot exists."});
	}
});

}else{
	res.status(400);
	res.send({"status":"error","msg":"user id is missing"});
    //res.send({"status":"success","msg":"mobile number send successfully"});
}
}

// updating driver info when he register with Facebook or Gmail

function updateDriverDetails(req,res,next){
	var driverDetails = req.body;
	if(driverDetails.phonenumber&&driverDetails.licenceId&&driverDetails.vnumber&&driverDetails.ctype){
		var usertype = driverDetails.usertype;
		// ^(0|\+91)?[789]\d{9}$
		var phoneReg = new RegExp("^[7-9][0-9]{9}$"); 
		if(phoneReg.test(driverDetails.phonenumber)){
		driverDetails.mconfid = Math.random().toString(36).substr(2,4);
       User.findOne({"phonenumber":driverDetails.phonenumber},function(err,result){
			if(err){
				res.status(500);
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if((result)&&(driverDetails._id != result._id)){
					res.status(409);
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
				 User.update({"_id":driverDetails._id},{"phonenumber":driverDetails.phonenumber,"mconfirm":false,"mconfid":driverDetails.mconfid,"licenceId":driverDetails.licenceId,"vnumber":driverDetails.vnumber,"ctype":driverDetails.ctype,"usertype":usertype},function(err1,result1){
						if(err1){
							res.status(500);
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+driverDetails.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = driverDetails.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err2,messageResult){
     		 	 	if(err2){
     		 	 		console.log(err2);
     		 	 		res.status(500);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		res.status(200);
     		 	 		res.send({"status":"success","msg":"Driver details updated successfully.Please confirm your mobile number"});
     		 	 	}
     		 	 });
						}
					});
				}
			}
		});
}else{
			res.status(409);
			res.send({"status":"error","msg":"user already confirmed his mobile number."});
		}
	}else{
		res.status(400);
		res.send({"status":"error","msg":"driver licenceid or vehicle number or vehicle type or mobile number is missing"});
	}
}

//confirmation mail resending

function resendConfEmail(req,res,next){
var body = req.body;
if(body._id){
 User.findOne({"_id":body._id},function(err,result1){
	if(err){
		res.status(500);
		res.send({"status":"error","msg":"error while getting userinfo"});
	}else if(result1){
		if(!(result1.confirm)){
		var emilValues={};
     	emilValues.username = result1.username;
     	var confirmid = result1.confid;
     //	emilValues.email = data.email;
     	emilValues.conformationlink = host+"/conf/user/"+confirmid;
     //	console.log(emilValues);
     	app.render("register-mail",emilValues,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.status(500);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailObj = {};
     		emailObj.email = result1.email;
     		emailObj.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailObj.subject = "You missed last time.Registartion Conformation mail";

     		 email(emailObj,function(err,success){
     		 	if(err){
     		 		res.status(500);
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
     		 		res.status(200);
     		 		res.send({"status":"success","msg":"mail send successfully"});
     		 	}
     		 });
     		}
     	});
     }else{
     	res.status(409);
     	res.send({"status":"error","msg":"user already confirmed his email address."});
     }
	}else{
		res.status(404);
		res.send({"status":"error","msg":"user does not exists."});
	}
});
}else{
	res.status(400);
	res.send({"status":"error","msg":"user id is missing"});
    //res.send({"status":"success","msg":"mobile number send successfully"});
}

}

// Save Login Audit

function loginAuditInsert(req,res,next){
var loginAuditInfo = new LoginAudit(req.body);
console.log(loginAuditInfo);
if((loginAuditInfo.user_id)&&(loginAuditInfo.location)){
	loginAuditInfo._id = uuid.v4();
loginAuditInfo.datetime = moment.utc().format();// 'YYYY-MM-DDTHH:mm:ss'
  loginAuditInfo.save(function(err,result){
if(err){
	res.status(500);
res.send({"status":"error","msg":"Login info storing failed."});
}else{
	res.status(200);
res.send({"status":"success","msg":"Record updated successfully."});
}
});
}else{
	res.status(409);
	res.send({"status":"error","msg":"userid or location id fields are missing"});
}
}


return {
 oauthLoginHandler:oauthLoginHandler,
  controle:controle,
 insertUsers:insertUsers,
 login:login,
 forgotPassword:forgotPassword,
 emailConfirmation:emailConfirmation,
 resetPage:resetPage,
 resendConfEmail:resendConfEmail,
 resetPasswd:resetPasswd,
 verifyMobileNumber:verifyMobileNumber,
 updateDriverDetails:updateDriverDetails,
 updateMobileNumber:updateMobileNumber,
 resendMobileConfCode:resendMobileConfCode,
 loginAuditInsert:loginAuditInsert
}
};
module.exports = userController;