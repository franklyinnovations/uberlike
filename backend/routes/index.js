var express = require('express');
var uuid = require('node-uuid');
var md5 = require('md5');
var FacebookStrategy = require('passport-facebook').Strategy;
//var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;//OAuthStrategy;
var twilio = require('twilio');

var router = express.Router();
//var db = mongo.db("mongodb://localhost:27017/uberlikedb"); // logintest
var moment = require('moment');
console.log("utc time is:"+moment.utc());
console.log("utc formate date and time after 4 hours is:"+moment.utc().add(4, 'hours').format('YYYY-MM-DD HH:mm:ss'));
if(moment.utc().format('YYYY-MM-DD HH:mm:ss')<=moment.utc().add(4, 'hours').format('YYYY-MM-DD HH:mm:ss')){
	console.log("i am from true");
}else{
	console.log("i am from false");
}
// moment.utc();
/*
  Details of global required parameters 
 */
//

var FACEBOOK_APP_ID = "1033910573287452";
var FACEBOOK_APP_SECRET = "62c751aa570cae0e94e092c8b4e8449f";

var GOOGLE_CLIENT_ID = "900607789971-n6h2130p69shrh3sjmn6cmq5e960hldf.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "Y0Z0jk99lgfiEpljUga7stPr";

var accountSid = "ACf678f8a1909b0f5c04df81e42e4af2fc";   //"AC3135929726be140536b50485c60057e7";
var authToken = "837d2b93452b137288ee26bfb82c75d1" ;    //"2ba7d45082ef1ddf1d90993d4e7463a2";

var host = "http://localhost:3000";

var client = new twilio.RestClient(accountSid, authToken);
/* GET home page. */
router.get('/test/cookie',function(req,res,next){
	console.log(req.cookies.user);
	res.send({"cookiesData":req.cookies.user});
});
router.get('/', function(req, res, next) {
  res.render('index', { layout:'main' });
});
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

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost/auth/facebook/callback",
    profileFields : ['emails','name'], // , 'first_name', 'last_name'
    enableProof: true//false
  },
  function(accessToken, refreshToken, profile,done) {
    console.log(profile);
	  return done(null, profile);
  }
));

router.get('/auth/facebook',
		  passport.authenticate('facebook',{ scope: ['email'] }));
router.get('/auth/facebook/callback',
		  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
		  function(req, res) {
		    // Successful authentication, redirect home.
		    userhandling(req.user,res);

		    //res.send({"success":"facebook login success"});
		  });
/*
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile);
      return done(null, profile);
  }
));
*/
passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done){
   // console.log(profile);
    //userhandling(profile)
	  return done(null, profile);
  }
));


router.get('/auth/google',
		  passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read'] })); // { scope: 'https://www.google.com/m8/feeds' }

router.get('/auth/google/callback', 
		  passport.authenticate('google', { failureRedirect: '/404' }),
		  function(req, res) {
		    // Successful authentication, redirect home.
		   console.log("i am from call back data");
		    //console.log(req.user);
		    userhandling(req.user,res);
		  //  res.send({"success": "google login success"});
		  });
	  
var userhandling = function(data,res){
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
	if(phonenumber){
		res.redirect('http://localhost/#/');
	}else{
		res.redirect('http://localhost/#/mobilenum');
	}
   // res.send({"status":"success","msg":"user login successfully","userdata":result});
}else{
	user.confid = uuid.v4();
	user.confirm = true;
	var confirmid= user.confid;
	db.collection("user").insert(user,function(err1,result1){
		if(err1){
			res.send({"status":"error","msg":"error while inserting the user data"});
		}else{
		 	//user = JSON.stringify(user);
		 	console.log("cookie setting ---------from new account");
			res.cookie('user',JSON.stringify(user));
			res.redirect('http://localhost/#/mobilenum');
		//	res.send({"status":"success","msg":"user registered success fully","userdata":user});
		}
	});
	/*
	var passeddata={};
     	passeddata.username = user.username;
     //	passeddata.email = data.email;
     	passeddata.conformationlink = host+"/conf/user/"+confirmid;
     	app.render("register-mail",passeddata,function(error,html){
     		if(error){
     			console.log(error,html);
     			res.send({"status":"error","msg":"mail sending failed."});
     		}else{
     			var optionaldata = {};
     		optionaldata.email = user.email;
     		optionaldata.html = html;//"conform mail by click <a href="+passeddata.conformationlink+">here</a>";//html;
     		optionaldata.subject = "Registartion Conformation mail";
     		mail(optionaldata,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{
     		 		
     		 	}
     		 });
     	}
     });
     	*/
}
});
}
router.post("/insertuser",function(req,res,next){

var data = req.body;
console.log(data);
if(data.email && data.password && data.phonenumber){
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
db.collection("user").findOne({$or:[{"email":data.email},{"phonenumber":data.phonenumber}]},function(err,result){
if(err){
res.send({"status":"error","msg":"error while getting the user data"});
}else if(result){
res.send({"status":"error","msg":"user email or phone number already exists"});
}else{
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

     		 mail(optionaldata,function(err,success){
     		 	if(err){
     		 		res.send({"status":"error","msg":"mail sending to user is failed"});
     		 	}else{

     		 	 //	
     		 	 var messagetext = "Please confirm your mobile number by entering :-"+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 message(mobilenumber,messagetext,function(err,messageResult){
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
	res.send({"status":"error","msg":"one or more fields are missing"});
}
});

router.post("/login/passenger",function(req,res,next){
var userinfo = req.body;
console.log(req.body);
if(userinfo.email && userinfo.password){
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
	res.send({"status":"error","msg":"one or more fields are missing"});
}
});	

router.post("/forgotpassword",function(req,res,next){
var data = req.body;
console.log(data);
if(data.email){
	db.collection("user").findOne({"email":data.email},function(err,result){
		if(err){
			res.send({"status":"error","msg":"error while getting the user information"});
		}else if(result){
			//send email to user
			console.log(result);
			var temppasswordset = {};
			temppasswordset.tpassword= uuid.v4();//Math.random().toString(36).substr(2,8);
			temppasswordset.exptime = moment.utc().add(4, 'hours').format('YYYY-MM-DD HH:mm:ss');
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

     		 mail(optionaldata,function(err,success){
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
	res.send({"status":"error","msg":"user email is required"});
}
}); 

router.get('/conf/user/:confirmid',function(req,res,next){
var confid = req.params.confirmid;
db.collection("user").findOne({"confid":confid},function(err,result){
if(err){
res.send({"status":"error","msg":"error while confirm user data"});
}else if(result){
	if(result.confirm == true){
		res.send({"status":"success","msg":"user already confirmed."});
	}else{
db.collection("user").update({"_id":result._id},{"$set":{"confirm":true}},function(err1,result1){
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
});
router.get('/resetpwd/:tpassword',function(req,res,next){
var tlink = req.params.tpassword;
var settime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
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
});
router.post('/confirm/email/resend',function(req,res,next){
var data = req.body;
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

     		 mail(optionaldata,function(err,success){
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

});
router.post('/confirm/mobile/resend',function(req,res,next){
	var data = req.body;
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
     		 	 message(mobilenumber,messagetext,function(err,messageResult){
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
    //res.send({"status":"success","msg":"mobile number send successfully"});
});
router.post('/update/mobilenumber',function(req,res,next){
	var data = req.body;
	if(data.phonenumber){
		data.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":data.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":data._id},{"$set":{"phonenumber":data.phonenumber,"mconfirm":false,"mconfid":data.mconfid}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 message(mobilenumber,messagetext,function(err2,messageResult){
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
		res.send({"status":"error","msg":"please enter mobilenumber"});
	}
});
router.post('/update/driverdetails',function(req,res,next){
	var data = req.body;
	if(data.phonenumber){
		data.mconfid = Math.random().toString(36).substr(2,4);
		db.collection("user").findOne({"phonenumber":data.phonenumber},function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while checking"});
			}else{
				if(result){
					res.send({"status":"error","msg":"These phonenumber is already exists.Please choose another one."});
				}else{
					db.collection("user").update({"_id":data._id},{"$set":{"phonenumber":data.phonenumber,"mconfirm":false,"mconfid":data.mconfid,"licenceId":data.licenceId,"vnumber":data.vnumber,"ctype":data.ctype}},function(err1,result1){
						if(err1){
							res.send({"status":"error","msg":"Error while updating phonenumber"});
						}else{
							 var messagetext = "Please confirm your mobile number by entering "+data.mconfid+"."+"To continue verification process";
     		 	 var mobilenumber = data.phonenumber; 
     		 	 message(mobilenumber,messagetext,function(err2,messageResult){
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
		res.send({"status":"error","msg":"please enter mobilenumber"});
	}
});
router.post('/verify/mobile',function(req,res,next){
	var data = req.body;
	console.log(data);
	db.collection("user").findOne({"_id":data._id},function(err,result){
		if(err){
			res.send({"status":"error","msg":"error while getting userinfo"});
		}else if(result){
			if(!(result.mconfirm)){
				if(result.mconfid == data.mconfid){
				db.collection("user").update({"_id":result._id},{"$set":{"mconfirm":true}},function(err1,result1){
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
});

router.post('/reset/password',function(req,res,next){
var data = req.body;
console.log(data);
if(data._id&&data.password){
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
	res.send({"status":"error","msg":"Some user info is missing."});
}
});

/*
function sendemail(options,callback){
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'titaniumstudio0@gmail.com',
        pass: '92901529'
    }
});
var mailOptions = {
    from: "titaniumstudeio0@gmail.com", // sender address 
    to: options.email, // list of receivers 
    subject: options.subject, // Subject line 
   // text: 'Hello world ✔', // plaintext body 
    html: options.html//'<b>Hello world ✔</b>' // html body 
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
       
       // return console.log(error);
    	callback(error,null);
    }else{
    console.log(info);
 		callback(null,info);
 		}
});
*/

/* twillow messaging test */
router.get("/send/test/message",function(req,res){
//+17409364714
client.messages.create({
    to:'+919542750395',
    from:'+17409364714',
    body:'Hi venu i am sending the text message to greet you!.'
}, function(error, message) {
    if (error) {
        console.log(error.message);
        res.send({"status":"error","msg":error.message});
    }else{
    	res.send({"status":"success","msg":message});
    }
});
});

module.exports = router;