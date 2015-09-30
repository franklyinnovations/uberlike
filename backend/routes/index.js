var express = require('express');
var uuid = require('node-uuid');
var md5 = require('md5');
//var FacebookStrategy = require('passport-facebook').Strategy;
//var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;//OAuthStrategy;
var twilio = require('twilio');

var router = express.Router();
//var db = mongo.db("mongodb://localhost:27017/uberlikedb"); // logintest
var moment = require('moment');

var Hashids = require("hashids");
   var hashids = new Hashids("this is my salt", 0, "0123456789abcdef");
 
var id = hashids.encode(1234567);
console.log(hashids.encode());
console.log(hashids.encode());
console.log(id);

//controller initialization

var userController = require('../Controllers/userController')();

var passengerController = require('../Controllers/passengerController')();


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

/*
var FACEBOOK_APP_ID = "1033910573287452";
var FACEBOOK_APP_SECRET = "62c751aa570cae0e94e092c8b4e8449f";

var GOOGLE_CLIENT_ID = "900607789971-n6h2130p69shrh3sjmn6cmq5e960hldf.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "Y0Z0jk99lgfiEpljUga7stPr";
*/

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

 router.get('/controle',userController.controle);


router.post("/insertuser",userController.insertUsers); // insertuser

router.post("/login/passenger",userController.login);	

router.post("/forgotpassword",userController.forgotPassword); // forgotpassword 

router.get('/conf/user/:confirmid',userController.emailConfirmation);

router.post('conf/email',userController.emailConfirmation);   // emailconfirmation

router.get('/resetpwd/:tpassword',userController.resetPage);  // resetpage

router.post('/save/loginaudit',userController.loginAuditInsert);

 // router.post('/confirm/email/resend',userController.resendConfEmail);     // confirmemail

//router.post('/confirm/mobile/resend',userController.resendMobileConfCode); // mesgsend

router.post('/update/mobilenumber',userController.updateMobileNumber); // updatemobilenum

router.post('/update/driverdetails',userController.updateDriverDetails); // driverdetails

router.post('/verify/mobile',userController.verifyMobileNumber);  // verifymobile

router.post('/reset/password',userController.resetPasswd); // resetpasswd

router.get('/readcsv',userController.saveCsvFileData);

router.get('/storecsvdata',userController.saveLocationData);

router.get('/:city_location/share-taxi/:trip_address/:match_id',passengerController.contactPage);


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