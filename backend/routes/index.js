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

//controller initialization

var useroperations = require('../controllers/useroperations');


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

//testuser operations controller

router.get('/controle',useroperations.controle);

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
		    useroperations.checkuserinfo(req.user,res);

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
		  passport.authenticate('google', { failureRedirect: '/auth/google' }),
		  function(req, res) {
		    // Successful authentication, redirect home.
		   console.log("i am from call back data");
		    //console.log(req.user);
		    useroperations.checkuserinfo(req.user,res);
		  //  useroperations.userhandling(req.user,res);
		  //  res.send({"success": "google login success"});
		  }); 

router.post("/insertuser",useroperations.insertuser);

router.post("/login/passenger",useroperations.login);	

router.post("/forgotpassword",useroperations.forgotpassword); 

router.get('/conf/user/:confirmid',useroperations.emailconfirmation);

router.post('conf/email',useroperations.emailconfirmation);

router.get('/resetpwd/:tpassword',useroperations.resetpage);

router.post('/save/loginaudit',useroperations.loginAuditInsert);

 // router.post('/confirm/email/resend',useroperations.confirmemail);

//router.post('/confirm/mobile/resend',useroperations.mesgsend);

router.post('/update/mobilenumber',useroperations.updatemobilenum);

router.post('/update/driverdetails',useroperations.driverdetails);

router.post('/verify/mobile',useroperations.verifymobile);

router.post('/reset/password',useroperations.resetpasswd);

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