
var should = require('should');
var sinon = require('sinon');

var mongoose = require('mongoose');

var driverController = require('../controllers/driverController')();

var db;

// TaxiLocation save

/*
{
	"driver_id":"1234555010101",
"location":{"type":"Point","coordinates":[78.46596479415894,17.446752341360767]},
"full_address":"3, Gurmurthy Colony Rd, Begumpet, Hyderabad, Telangana 500016, India",
"isOccupied":false
}	
*/


before(function(done){
 	db = mongoose.connect("mongodb://localhost/test");
	done();
});

describe('Driver controller tests',function(){

 it('inserting driver location',function(done){

 	var req = {

 	};

 	req.body = {
 		"driver_id":"1",
"location":{"type":"Point","coordinates":[78.46596479415894,17.446752341360767]},
"full_address":"3, Gurmurthy Colony Rd, Begumpet, Hyderabad, Telangana 500016, India",
"isOccupied":false
 	};

 	var res = {
 		status:sinon.spy(),
 		send:sinon.spy()
 	}

 	driverController.saveTaxiLocation(req,res);

 	setTimeout(function(){

 		res.status.calledWith(200).should.equal(true,"DRIVER details updated successfully.");
 		done();

 	},3000);

 });

});

after(function(done){

   
   for(var i in mongoose.connection.collections){
   	mongoose.connection.collections[i].remove(function(){

   	});
   }
   
	done();
});