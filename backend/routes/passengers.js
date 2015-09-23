var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var passengercontroller = require('../controllers/passengercontroller');
var router = express.Router();
//console.log(moment().format('YYYY-MM-DD'));
router.get('/', function(req, res, next) {
	console.log("I am from requested url "+req.url);
	console.log(req.url);
    res.send({"status":"error","msg":"I am from users"});
});

 // router.post('/search/destination',passengercontroller.searchedLocations);

 // router.post('/savesearch',passengercontroller.saveUserLocation);

 // router.post('/setlocation',passengercontroller.setLocation);

router.post('/avilabletaxies',passengercontroller.findNearTaxies);

 // router.post('/saveroute',passengercontroller.saveRouteInfo);

 // router.post('/findmatchroutes',passengercontroller.findMatchResult);

 // router.post('/savetrip',passengercontroller.saveTripData);

router.post('/decoded/polyline',passengercontroller.poliLineDecode);

router.post('/searched/trip',passengercontroller.saveSearchData);

router.post('/match/trips',passengercontroller.findMatchedTrips);

router.post('/send/sharemessage',passengercontroller.sendShareMessage);

router.post('/search/matches',passengercontroller.searchData);

module.exports = router;