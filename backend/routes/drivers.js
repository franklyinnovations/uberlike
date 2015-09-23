var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var drivercontroller = require('../controllers/drivercontroller');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send({"status":"error","msg":"I am from users"});
});

// router.post('/setdefault/status',drivercontroller.setStatus);

router.post('/taxilocation',drivercontroller.saveTaxiLocation);

module.exports = router;