var userController = function(){
	var mongo = require('mongoskin');
if(process.env.ENV == 'Test'){
var dbUrl = "mongodb://localhost:27017/uberlikedb_test";  
}else{
var dbUrl = "mongodb://localhost:27017/uberlikedb";
}

var db = mongo.db(dbUrl);

var uuid = require('node-uuid');
 //  var md5 = require('md5');
var twilio = require('twilio');
var moment = require('moment');
var validator = require('validator');
var fs = require('fs');
var request = require('request');
var bcrypt = require('bcrypt-node');

 //console.log('bcript string:---------');
 //  var hash = bcrypt.hashSync('92901529');
 //  var result = bcrypt.compareSync('92901529',hash);
 // console.log(hash);

var userModel = require('../Models/user')();
var loginAuditModel = require('../Models/loginAudit')();

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

var user = {};
user.email = data.emails[0].value;


userModel.getOne(user,function(err,result){
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
	userModel.insert(user,function(err1,result1){
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

var userData = req.body;
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
userModel.getOne({$or:[{"email":userData.email},{"phonenumber":userData.phonenumber}]},function(err,result){
if(err){
	res.status(500);
res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
	res.status(409);
res.send({"status":"error","msg":"user email or phone number already exists"});
}else{
	userData.signupdate = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
 userModel.insert(userData,function(err,result1){
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
	userModel.getOne({"email":userinfo.email},function(err,result){
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
	userModel.getOne({"email":userInfo.email},function(err,result){
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
  	userModel.update({"_id":result._id},temppasswordset,function(err1,result1){
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
 userModel.getOne({"confid":confid},function(err,result){
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
   userModel.update({"_id":result._id},{"confirm":true,"enable":result.enable},function(err1,result1){
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
   userModel.getOne({"tpassword":tlink},function(err,result){
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

 userModel.getOne({"_id":resetData._id},function(err,result){
	if(err){
		res.status(500);
		res.send({"status":"error","msg":"Error while getting user information."});
	}else if(result){
		userModel.update({"_id":result._id},{"password":bcrypt.hashSync(resetData.password),"preset":true},function(err1,result1){
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

	 userModel.getOne({"_id":userData._id},function(err,result){
		if(err){
			res.status(500);
			res.send({"status":"error","msg":"error while getting userinfo"});
		}else if(result){
			if(!(result.mconfirm)){
				if(result.mconfid == userData.mconfid){
					if(result.confirm){
						result.enable = true;
					}
				   userModel.update({"_id":result._id},{"mconfirm":true,"enable":result.enable},function(err1,result1){
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
		userModel.getOne({"phonenumber":userData.phonenumber},function(err,result){
			if(err){
				res.status(500);
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.status(409);
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					 userModel.update({"_id":userData._id},{"phonenumber":userData.phonenumber,"mconfirm":false,"mconfid":userData.mconfid,"usertype":usertype},function(err1,result1){
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
  userModel.getOne({"_id":userData._id},function(err,result1){
	if(err){
		res.status(500);
		res.send({"status":"error","msg":"error while getting userinfo"});
	}else if(result1){
		if(!(result1.mconfirm)){
			var newobj={};
newobj.mconfid = Math.random().toString(36).substr(2,4);
newobj.mconfirm = false;
      userModel.update({"_id":result._id},newobj,function(err1,result2){
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
       userModel.getOne({"phonenumber":driverDetails.phonenumber},function(err,result){
			if(err){
				res.status(500);
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.status(409);
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
				 userModel.update({"_id":driverDetails._id},{"phonenumber":driverDetails.phonenumber,"mconfirm":false,"mconfid":driverDetails.mconfid,"licenceId":driverDetails.licenceId,"vnumber":driverDetails.vnumber,"ctype":driverDetails.ctype,"usertype":usertype},function(err1,result1){
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
		})
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
userModel.getOne({"_id":body._id},function(err,result1){
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
var loginAuditInfo = req.body;
console.log(loginAuditInfo);
if((loginAuditInfo.user_id)&&(loginAuditInfo.location)){
	loginAuditInfo._id = uuid.v4();
loginAuditInfo.datetime = moment.utc().format();// 'YYYY-MM-DDTHH:mm:ss'
 loginAuditModel.insert(loginAuditInfo,function(err,result){
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

function saveCsvFileData(req,res,next){
	  var fs = require('fs');
    var geocoder = require('geocoder');
    var async = require('async');
    console.log(__dirname);

var csv = require("fast-csv");

var inputFile = __dirname+'/../routeData.csv';
var stream = fs.createReadStream(inputFile);
 var results = [];
 var successResults = [];
 var errors = [];
 var error = {};
csv
 .fromStream(stream, {headers : ["fromLocation","toLocation"]})
 .on("data", function(data){

    results.push(data);
  //   console.log(data);
 })
 .on("end", function(){
  //   console.log("done");
 //    console.log(error);
   async.eachSeries(results,function(eachLocation,locationCallback){
   	eachLocation._id = uuid.v4();
   	db.collection("csv_results1").insert(eachLocation,function(err,insResults){
   		if(err){
   			console.log(err);
   			console.log("error at from "+eachLocation.fromLocation+" to "+eachLocation.toLocation);
   			locationCallback();
   		}else{
   			locationCallback();
   		}
   	})
   },function(errorsinEach){
   		res.send({"result":successResults,"errors":errors});
   });
 });
}

function saveLocationData(req,res,next){
	var async = require('async');
	//var geocoder = require('geocoder');
	var geocoderProvider = 'google';
var httpAdapter = 'https';
// optionnal
var extra = {
    apiKey: 'AIzaSyDVksvEMbTZTClxjY-touspszFsJSutiIY', // for Mapquest, OpenCage, Google Premier  // YOUR_API_KEY
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
	var successResults = [];
	var errors = [];
	var error = {};
	db.collection("csv_results").find({"status":{$exists:false}}).toArray(function(errL,locationResults){
		if(errL){
			console.log("error while finding the results");
		}else if((locationResults)&&(locationResults.length)){
			async.eachSeries(locationResults,function(eachLocation,locationCallback){
				async.parallel({
        from:function(fromCallback){
            geocoder.geocode(eachLocation.fromLocation, function ( errs, geocodeData ) {
  if(errs){
        console.log("I from error");
        fromCallback(errs,null);
  }else if((geocodeData)&&(geocodeData.length)){
      //      console.log(geocodeData.results[0].formatted_address);
      //      console.log(geocodeData.results[0].geometry);
      //      var loc = geocodeData.results[0].geometry.location;
            var fromLocationObj = {};
            fromLocationObj.location = {
                "type":"Point",
                "coordinates":[geocodeData[0].longitude,geocodeData[0].latitude]
            };
            fromLocationObj.full_address = geocodeData[0].formattedAddress;
            fromLocationObj._id = uuid.v4();
      //      console.log(fromLocationObj);
            db.collection("csv_geo_locations").findOne({"location":fromLocationObj.location},function(err,locationResult){
                if(err){
                    fromCallback(err,null)
                }else if(locationResult){
                    fromCallback(null,locationResult);
                    console.log("location already exists.");
                }else{
                    db.collection("csv_geo_locations").insert(fromLocationObj,function(err1,insResult){
                        if(err1){
                        	console.log("Error at from insert");
                            fromCallback(err1,null)
                        }else{
                            fromCallback(null,fromLocationObj);
                        }
                    })
                }
            });
  }else{
            
            error.from = eachLocation.fromLocation;
            errors.push(eachLocation);
            fromCallback(geocodeData,null);
         //    console.log(data);
            
  }
});
        },
        to:function(toCallback){
            geocoder.geocode(eachLocation.toLocation, function ( errs, geocodeData ) {
        console.log("To Location");
 // console.log(geocodeData);
  if(errs){
    console.log("I am from to error");
    toCallback(errs,null);
  }
   else if((geocodeData)&&(geocodeData.length)){
   //    console.log(geocodeData.results[0].formatted_address);
   //     console.log(geocodeData.results[0].geometry.location);
 // var loc = geocodeData.results[0].geometry.location;
var toLocationObj = {}; 
    toLocationObj.location = {
        "type":"Point",
        "coordinates":[geocodeData[0].longitude,geocodeData[0].latitude]
    };
    toLocationObj.full_address = geocodeData[0].formattedAddress;
    toLocationObj._id = uuid.v4();
 //   console.log(toLocationObj);
      db.collection("csv_geo_locations").findOne({"location":toLocationObj.location},function(err,locationResult){
                if(err){
                    toCallback(err,null)
                }else if(locationResult){
                    toCallback(null,locationResult);
                    console.log("location already exists.");
                }else{
                    db.collection("csv_geo_locations").insert(toLocationObj,function(err1,insResult){
                        if(err1){
                        	console.log("From insert");
                            toCallback(err1,null)
                        }else{
                            toCallback(null,toLocationObj);
                        }
                    })
                }
            });
  }else{
            error.to = eachLocation.toLocation;
            errors.push(eachLocation);
            toCallback(geocodeData,null);
      //      console.log(data);
      //      res.send({"status":"error","errorobj":error});
      //      exit;
  }
});
        }
    },function(errs,locationResults){
        if(errs){
            console.log("error at :"+eachLocation.fromLocation +"    to:"+eachLocation.toLocation);
            console.log(errs);
            locationCallback()
        }else if((locationResults)&&(locationResults.from)&&(locationResults.to)){
            var routeObj = {};
            routeObj._id = uuid.v4();
            routeObj.way_points = [];
            routeObj.start_location = locationResults.from._id;
            routeObj.end_location = locationResults.to._id;
            routeObj.route_name = "Route From "+eachLocation.fromLocation+" to "+eachLocation.toLocation;

            db.collection("csv_geo_routes").findOne({"start_location":routeObj.start_location,"end_location":routeObj.end_location},function(errRoutes,routeResult){
            	if(errRoutes){
            		console.log("error while getting the results");
            		locationCallback();
            	}else if(routeResult){
            		console.log("alredy existing route");
            		console.log(eachLocation);
            		db.collection("csv_results").update({"_id":eachLocation._id},{"$set":{"status":"S"}},function(err,result1){
            		locationCallback();
            		});
            	}else{
            	  db.collection("csv_geo_routes").insert(routeObj,function(err,results){
                        if(err){
                                 console.log("error while inserting the routes data");
                                 locationCallback();
                        }else{
                            // results.push(data);
                            db.collection("csv_results").update({"_id":eachLocation._id},{"$set":{"status":"S"}},function(err,result1){
                            	 successResults.push(eachLocation);
                            locationCallback();
                            }); 
                        }
                    });	
            	}
            });
        }else{
            console.log("I am from else block");
            locationCallback();
        }

    });
			},function(errorsinEach){
				res.send({"results":successResults,"errors":errors});
			})
		}else{
			console.log("object is empty");
		}
	})
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
 loginAuditInsert:loginAuditInsert,
 saveCsvFileData:saveCsvFileData,
 saveLocationData:saveLocationData
}
};
module.exports = userController;