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

var errorMsg = {
	obj:"Error in user operation",
	property:'default user',
	errormsg:'default error message'
}

//Facebook or Google registered userhanling

function oauthLoginHandler(data,res){
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

function insertUsers(req,res,next){

var userData = req.body;
console.log(data);
if(userData.email && userData.password && userData.phonenumber){
	//    ^(0|\+91)?[789]\d{9}$
	var phoneReg = new RegExp("^[7-9][0-9]{9}$");
	if(validator.isEmail(userData.email)){
		if(!(validator.isNull(userData.password))){
			//isLength(str, min
			if(validator.isLength(userData.password,8)){

				if(phoneReg.test(userData.phonenumber)){

			
	userData.password = md5(userData.password);
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
db.collection("user").findOne({$or:[{"email":userData.email},{"phonenumber":userData.phonenumber}]},function(err,result){
if(err){
res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
res.send({"status":"error","msg":"user email or phone number already exists"});
}else{
	userData.signupdate = moment.utc().format(); // 'YYYY-MM-DDTHH:mm:ss'
 db.collection("user").insert(userData,function(err,result1){
     if(err){
     	res.send({"status":"error","msg":"failed to insert user information"});
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
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailDetails = {};
     		emailDetails.email = userData.email;
     		emailDetails.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailDetails.subject = "Registartion Conformation mail";

     		 email(emailDetails,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{

     		 	 //	
     		 	 var messagetext = "Please confirm your mobile number by entering :-"+userData.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = userData.phonenumber; 
     		 	 sms(mobilenumber,messagetext,function(err,messageResult){
     		 	 	if(err){
     		 	 		console.log(err);
     		 	 		res.send({"status":"error","msg":"message sending failed"});
     		 	 	}else{
     		 	 		delete userData["password"];
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
					res.send({"status":"error","msg":"Please enter valid Phone number","errorobj":errorMsg});
				}
			}else{
				errorMsg.obj = "user inserting";
	errorMsg.property='Password';
	errorMsg.errormsg='Password must be 8 characters';
					res.send({"status":"error","msg":"password must be 8 characters or more","errorobj":errorMsg});
			}
		}else{
			errorMsg.obj = "user inserting";
	errorMsg.property='Password';
	errorMsg.errormsg='Please enter password';
					res.send({"status":"error","msg":"Please enter password","errorobj":errorMsg});
		}
	}else{
		errorMsg.obj = "user inserting";
	errorMsg.property='email address';
	errorMsg.errormsg='Invalid Email.';
					res.send({"status":"error","msg":"Please enter valid email","errorobj":errorMsg});
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
	errorMsg.obj = "user login";
	errorMsg.property='password';
	errorMsg.errormsg='Password must be 8 characters';
					res.send({"status":"error","msg":"password must be 8 characters or more","errorobj":errorMsg});
			}
		}else{
			errorMsg.obj = "user Login";
	errorMsg.property='password';
	errorMsg.errormsg='Please enter password.';
					res.send({"status":"error","msg":"Please enter password","errorobj":errorMsg});
		}
	}else{
		errorMsg.obj = "user Login";
	errorMsg.property='email';
	errorMsg.errormsg='Please enter valid Email.';
					res.send({"status":"error","msg":"Please enter valid email","errorobj":errorMsg});
	}

}else{
	res.send({"status":"error","msg":"one or more fields are missing"});
}
}

//forgotpassword recover by sending email

function forgotPassword(req,res,next){
var userInfo = req.body;
console.log(userInfo);
if(userInfo.email){
	if(validator.isEmail(userInfo.email)){
	db.collection("user").findOne({"email":userInfo.email},function(err,result){
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
			var emilValues = {};
			emilValues.username = result.username;
			emilValues.plink = 'http://localhost/resetpwd/'+temppasswordset.tpassword;
			console.log(emilValues);
			app.render("passwordreset",emilValues,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailObj = {};
     		emailObj.email = result.email;
     		emailObj.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailObj.subject = "Reset password";

     		 email(emailObj,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
  	db.collection("user").update({"_id":result._id},{"$set":temppasswordset},function(err1,result1){
  		if(err1){
  			res.send({"status":"error","msg":"Error while setting the user password resetting"});
  		}else{
  			res.send({"status":"success","msg":"Email send to "+userInfo.email+" successfully."});
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

function emailConfirmation(req,res,next){
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

function resetPage(req,res,next){
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

function resetPasswd(req,res,next){
var resetData = req.body;
console.log(resetData);
if(resetData._id&&resetData.password){

if(!(validator.isNull(resetData.password))){
			//isLength(str, min
			if(validator.isLength(resetData.password,8)){

db.collection("user").findOne({"_id":resetData._id},function(err,result){
	if(err){
		res.send({"status":"error","msg":"Error while getting user information."});
	}else if(result){
		db.collection("user").update({"_id":result._id},{"$set":{"password":md5(resetData.password),"preset":true}},function(err1,result1){
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

function verifyMobileNumber(req,res,next){
	var userData = req.body;
	console.log(userData);
	if(!(validator.isNull(userData.mconfid))){

	db.collection("user").findOne({"_id":userData._id},function(err,result){
		if(err){
			res.send({"status":"error","msg":"error while getting userinfo"});
		}else if(result){
			if(!(result.mconfirm)){
				if(result.mconfid == userData.mconfid){
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

function updateMobileNumber(req,res,next){
	var userData = req.body;
	if(userData.phonenumber){
		//^(0|\+91)?[789]\d{9}$
		var phoneReg = new RegExp("^[7-9][0-9]{9}$"); 
		if(phoneReg.test(userData.phonenumber)){
		var usertype = userData.usertype;
		userData.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":userData.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":userData._id},{"$set":{"phonenumber":userData.phonenumber,"mconfirm":false,"mconfid":userData.mconfid,"usertype":usertype}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+userData.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = userData.phonenumber; 
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

function resendMobileConfCode(req,res,next){
	var userData = req.body;
	if(userData._id){
db.collection("user").findOne({"_id":userData._id},function(err,result1){
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

function updateDriverDetails(req,res,next){
	var driverDetails = req.body;
	if(driverDetails.phonenumber&&driverDetails.licenceId&&driverDetails.vnumber&&driverDetails.ctype){
		var usertype = driverDetails.usertype;
		// ^(0|\+91)?[789]\d{9}$
		var phoneReg = new RegExp("^[7-9][0-9]{9}$"); 
		if(phoneReg.test(driverDetails.phonenumber)){
		driverDetails.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":driverDetails.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":driverDetails._id},{"$set":{"phonenumber":driverDetails.phonenumber,"mconfirm":false,"mconfid":driverDetails.mconfid,"licenceId":driverDetails.licenceId,"vnumber":driverDetails.vnumber,"ctype":driverDetails.ctype,"usertype":usertype}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+driverDetails.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = driverDetails.phonenumber; 
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

function resendConfEmail(req,res,next){
var body = req.body;
if(body._id){
db.collection("user").findOne({"_id":body._id},function(err,result1){
	if(err){
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
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var emailObj = {};
     		emailObj.email = result1.email;
     		emailObj.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailObj.subject = "You missed last time.Registartion Conformation mail";

     		 email(emailObj,function(err,success){
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

})();