var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var passengercontroller = require('../controllers/passengerController')();
var router = express.Router();

router.get('/', function(req, res, next) {
	console.log("I am from requested url "+req.url);
	console.log(req.url);
    res.send({"status":"error","msg":"I am from users"});
});


router.post('/avilabletaxies',passengercontroller.findNearTaxies);

router.post('/searched/trip',passengercontroller.saveSearchData);

router.post('/match/trips',passengercontroller.findMatchedTrips);

router.post('/send/sharemessage',passengercontroller.sendShareMessage);

router.post('/search/matches',passengercontroller.searchData);

router.post('/confirmation/sharetrip',passengercontroller.contactPassenger);

router.post('/sharedcontact/userinfo',passengercontroller.getMatchShareUserInfo);

module.exports = router;