var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send({"status":"error","msg":"I am from users"});
});
router.get('/newone',function(req,res,next){
	res.send({"status":"success","msg":"I am from newone"});
});

module.exports = router;