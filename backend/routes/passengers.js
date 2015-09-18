var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var passengercontroller = require('../controllers/passengercontroller');
var router = express.Router();
//console.log(moment().format('YYYY-MM-DD'));
router.get('/', function(req, res, next) {
    res.send({"status":"error","msg":"I am from users"});
});

router.post('/search/destination',passengercontroller.searchedLocations);

router.post('/savesearch',passengercontroller.saveUserLocation);

router.post('/setlocation',passengercontroller.setLocation);

router.post('/avilabletaxies',passengercontroller.findNearTaxies);

router.post('/saveroute',passengercontroller.saveRouteInfo);

router.post('/findmatchroutes',passengercontroller.findMatchResult);

router.post('/savetrip',passengercontroller.saveTripData);

router.post('/decoded/polyline',passengercontroller.poliLineDecode);

router.post('/searched/trip',passengercontroller.saveSearchData);

module.exports = router;