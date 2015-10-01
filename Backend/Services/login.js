	var express = require('express');
	var router = express.Router();
	var useroperations = require('../Controllers/userController')();

	 //  var useroperations = {};
 	var passport= require('passport');
 
	var FacebookStrategy = require('passport-facebook').Strategy;

	var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

	 // var GoogleStrategy = require('passport-google-oauth2').Strategy;

	var FACEBOOK_APP_ID = "1033910573287452";
	var FACEBOOK_APP_SECRET = "62c751aa570cae0e94e092c8b4e8449f";

	var GOOGLE_CLIENT_ID = "900607789971-n6h2130p69shrh3sjmn6cmq5e960hldf.apps.googleusercontent.com";
	var GOOGLE_CLIENT_SECRET = "Y0Z0jk99lgfiEpljUga7stPr";

	var host = "http://localhost";

	var LocalStrategy = require("passport-local").Strategy;
var User = require("../Models/user")();


var localRegisterInit = function(req, email, password, callback) {
	User.getOne( { "local.email" : email}, function(err, user) {
		if (err) {
			return callback(err);
		}
		
		if (user) {
			// TODO: supply message
			return callback(null, false);
		}
		
		var newUser = {};
		newUser.local = {};
		newUser.local.email = email;
		newUser.local.password; //newUser.hashPassword(password);
		
		User.insert(newUser,function(err) {
			if (err) {
				throw err;
			}
			
			return callback(null, newUser);
		});
	});
};

var localLoginInit = function(req, email, password, callback) {
	 User.getOne( { "local.email" : email}, function(err, user) {
		if (err) {
			return callback(err);
		}
		
		if (!user || !user.local.password || (password != user.local.password)) {
			// TODO: supply generic message
			return callback(null, false);
		}
		
		return callback(null, user);
	});
};

var localOptions = {
	usernameField : "emailAddress",
	passReqToCallback : true
};

passport.use("local-register", new LocalStrategy(localOptions, localRegisterInit));
passport.use("local-login", new LocalStrategy(localOptions, localLoginInit));

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});
	passport.deserializeUser(function(user, done) {
	    done(null, user);
	});

	passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: host+"/auth/facebook/callback",
    profileFields : ['emails','name','photos','gender'], // , 'first_name', 'last_name' , 'public_profile' , 'user_photos' // gender
    enableProof: true//false
  },
  function(accessToken, refreshToken, profile,done) {
    console.log(profile);
	  return done(null, profile);
  }
));

router.get('/auth/facebook',
		  passport.authenticate('facebook',{ scope: ['email','user_photos'] }));  // ,'public_profile'

// authorize

router.get('/connect/facebook',
		  passport.authorize('facebook',{ scope: ['email','user_photos'] }));  // ,'public_profile'

router.get('/auth/facebook/callback',
		  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
		  function(req, res) {
		    // Successful authentication, redirect home.
		    useroperations.oauthLoginHandler(req.user,res);

		    //res.send({"success":"facebook login success"});
		  });


// host+"/auth/google/callback",


/*
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL:  host+"/auth/google/callback", // "http://127.0.0.1:3000/auth/google/callback",
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
    callbackURL: host+"/auth/google/callback"
 //    profileFields : ['emails','name','photos','gender']
  },
  function(accessToken, refreshToken, profile, done){
    console.log(profile);
    //userhandling(profile)
	  return done(null, profile);
  }
));

router.get('/local/login', passport.authenticate("local-login", {
		successRedirect : "/",
		failureRedirect : "/local/login"
	}));

router.get('/local/register',passport.authenticate("local-register", {
		successRedirect : "/",
		failureRedirect : "/local/register"
	}));

router.get('/auth/google',
		  passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read','profile','https://www.googleapis.com/auth/userinfo.profile'] })); // { scope: 'https://www.google.com/m8/feeds' }

router.get('/connect/google',
		  passport.authorize('google',{ scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read','profile','https://www.googleapis.com/auth/userinfo.profile'] })); // { scope: 'https://www.google.com/m8/feeds' }

router.get('/auth/google/callback', 
		  passport.authenticate('google', { failureRedirect: '/auth/google' }),
		  function(req, res) {
		    // Successful authentication, redirect home.
		   console.log("i am from call back data");
		    //console.log(req.user);
		  //  useroperations.checkuserinfo(req.user,res);
      useroperations.oauthLoginHandler(req.user,res);
		  //  useroperations.userhandling(req.user,res);
		  //  res.send({"success": "google login success"});
		  }); 
module.exports = router;