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

module.exports = router;