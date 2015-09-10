	var express = require('express');
	var router = express.Router();
	var useroperations = require('../controllers/useroperations');

	var FacebookStrategy = require('passport-facebook').Strategy;
	var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

	var FACEBOOK_APP_ID = "1033910573287452";
	var FACEBOOK_APP_SECRET = "62c751aa570cae0e94e092c8b4e8449f";

	var GOOGLE_CLIENT_ID = "900607789971-n6h2130p69shrh3sjmn6cmq5e960hldf.apps.googleusercontent.com";
	var GOOGLE_CLIENT_SECRET = "Y0Z0jk99lgfiEpljUga7stPr";

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
		    useroperations.oauthLoginHandler(req.user,res);

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
		  //  useroperations.checkuserinfo(req.user,res);
      useroperations.oauthLoginHandler(req.user,res);
		  //  useroperations.userhandling(req.user,res);
		  //  res.send({"success": "google login success"});
		  }); 
module.exports = router;