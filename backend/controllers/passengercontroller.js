module.exports = (function(){

var uuid = require('node-uuid');
var moment = require('moment');
var async = require('async');
var underscore = require('underscore');
var validator = require('validator');


	function searchedLocations(req,res,next){
	var locationData = req.body;
	if((locationData)&&(locationData.user_id)&&(locationData.present_lat)&&(locationData.present_lng)&&(locationData.dest_lat)&&(locationData.dest_lng)&&(locationData.time)){
		locationData._id = uuid.v4();
		locationData.date = moment().format('YYYY-MM-DD'); // HH:mm:ss
		db.collection("passengers").insert(locationData,function(err,result){
			if(err){
				res.send({"status":"error","msg":"Error while inserting user location."});
			}else{
				res.send({"status":"success","msg":"Successfully updated the searching details","passenger":locationData});
			}
		});
	}else{
		res.send({"status":"error","msg":"Missing some userinfo"});
	}
}

	function saveUserLocation(req,res,next){
		var locationData = req.body;
		if((locationData)&&(locationData.user_id)&&(locationData.fulladdress)&&(locationData.location)){
			locationData._id = uuid.v4();
			locationData.time = moment.utc().format(); // YYYY-MM-DDTHH:mm:ssZ 
			db.collection("location").findOne({"location":locationData.location},function(err,result){
				if(err){
					res.send({"status":"error","msg":"Error while getting info"});
				}else if(result){
					res.send({"status":"success2","msg":"Location already exists"});
				}else{
					db.collection("location").insert(locationData,function(err,results){
						if(err){
							res.send({"status":"error","msg":"Error while updating location"});
						}else{
							res.send({"status":"success","data":locationData});
						}
					});
				}
			});
		}else{
			res.send({"status":"error","msg":"some fields are missing"});
		}
	}

	function setLocation(req,res,next){
		var location = req.body;
		console.log(location);
		if((location)&&(location.location)&&(location.full_address)){
			location._id = uuid.v4();
			db.collection("locations").findOne({"location":location.location},function(err,result){
				if(err){
					res.send({"status":"error","msg":"Error while getting the location"});
				}else if(result){
					res.send({"status":"success","location":result});
				}else{
						db.collection("locations").insert(location,function(err,result){
				if(err){
					res.send({"status":"error","msg":"Error while inserting location"});
				}else{
					res.send({"status":"success","location":location});
				}
			});
				}
			});
			
		}else{
			res.send({"status":"error","msg":"Location or address is missing."});
		}
	}


	  // db.locations.find({ location : { $nearSphere : [ 78.486671,17.385044 ], $maxDistance: (9/6371) } }).pretty();

	 function findNearTaxies(req,res,next){
	 	var fromLocation = req.body;
	 	if((fromLocation)&&(fromLocation.coordinates)){
	 		var distance = fromLocation.distance || 1; // 10
	 	 //	var withInTime = moment.utc().add(5, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
	 	 var taxiResults = [];
	 	 	var moreTime = moment.utc().subtract('5','minutes').format(); // YYYY-MM-DDTHH:mm:ssZ
	 		db.collection("locations").find({"location" : { $nearSphere : {$geometry: {type : "Point",coordinates : fromLocation.coordinates}, $maxDistance: (distance * 1000) }}}).toArray(function(err,results){
	 			 if(err){
	 			 	 res.send({"status":"error","msg":"Error while getting location information"});
	 			 }else if((results)&&(results.length)){
	 			 	console.log("coming to results");
	 			 	console.log(results);   //  distance/6371
	 			 	var locationWiseTaxies = [];
	 			 	  async.each(results,function(eachLocation,callback){

	 			 	  	//   ,"date_time": { $gte:moreTime }
	 			 	  	db.collection("taxi_location").find({"location_id":eachLocation._id,"isOccupied":false}).toArray(function(err2,taxiResult){
	 			 	  		if(err2){
	 			 	  			callback(err2,null);
	 			 	  		}else{
	 			 	  			console.log(taxiResult);
	 			 	  			if((taxiResult)&&(taxiResult.length)){
	 			 	  				eachLocation.taxies = taxiResult;
	 			 	  				console.log(eachLocation);
	 			 	  	 //			taxiResuts.push(eachLocation);
	 			 	  	 			taxiResults.push(eachLocation);
	 			 	  			console.log("coming here to if condition");
	 			 	  			 //	console.log(taxiResult);
	 			 	  			callback(null,eachLocation);
	 			 	  		}else{
	 			 	  			callback(null,null);
	 			 	  		}
	 			 	  		}
	 			 	  	});
	 			 	  },function(err1,eachResult){
	 			 	  	if(err1){
	 			 	  		res.send({"status":"error","msg":"error while getting the taxies"});
	 			 	  	}else{
	 			 	  		// eachResult = eachResult || [];
	 			 	  		res.send({"status":"success","taxies":taxiResults});
	 			 	  	}
	 			 	  });
	 			 }else{
	 			 	res.send({"status":"success","taxies":[]});
	 			 }
	 		});

	 	}else{
	 		res.send({"status":"error","msg":"Some required information is missing."});
	 	}
	 }

	 function saveRoute(req,res,next){
	 	var routeInfo = req.body;
	 	if((routeInfo)&&(routeInfo.fromLocation)&&(routeInfo.toLocation)&&(routeInfo.startLocationAddress)&&(routeInfo.endLocationAddress)){
	 		async.parallel({
	 			one:function(callback){
	 				db.collection("locations").findOne({"location":routeInfo.fromLocation},function(err,result1){
	 			if(err){
	 						callback(err,null);
	 			}else if(result1){
	 						callback(null,result1);
	 			}else{
	 				var locationObj = {};
	 				locationObj._id = uuid.v4();
	 				locationObj.location = routeInfo.fromLocation;
	 				locationObj.full_address = routeInfo.startLocationAddress;
	 				db.collection("locations").insert(locationObj,function(err1,result2){
	 					if(err1){
	 						callback(err1,null);
	 					}else{
	 						callback(null,locationObj);
	 					}
	 				});
	 					//	callback(null,null);
	 				}
	 		});
	 			},
	 			two:function(callback){
	 					db.collection("locations").findOne({"location":routeInfo.toLocation},function(err,result3){
	 			if(err){
	 						callback(err,null);
	 			}else if(result3){
	 						callback(null,result3);
	 			}else{
	 				 var locationObj = {};
	 				 locationObj._id = uuid.v4();
	 				 locationObj.location = routeInfo.toLocation;
	 				 locationObj.full_address = routeInfo.endLocationAddress;
	 				 db.collection("locations").insert(locationObj,function(err2,result3){
	 				 	if(err2){
	 				 		callback(err2,null);
	 				 	}else{
	 				 		callback(null,locationObj);
	 				 	}
	 				 });
	 				   //		callback(null,null);
	 			}
	 		});
	 			}

	 			},function(asyncErr,locationResults){
	 				if(asyncErr){
	 					res.send({"status":"error","msg":"error while getting the result"});
	 				}else if((locationResults)&&(locationResults.one)&&(locationResults.two)){
	 					var startLocation = locationResults.one._id;
	 					var endLocation = locationResults.two._id;
	 					var obj = {};
	 					obj._id = uuid.v4();
	 					obj.route_name = "Route From "+routeInfo.startLocationAddress+" to "+routeInfo.endLocationAddress;
	 					obj.start_location = startLocation;
	 					obj.end_location = endLocation;
	 					db.collection("routes").findOne(obj,function(err,routeData){
	 						if(err){
	 							res.send({"status":"error","msg":"error while getting the route info"});
	 						}else if(routeData){
	 							res.send({"status":"success","route":routeData});
	 						}else{
	 							db.collection("routes").insert(obj,function(err,routeDetails){
	 						if(err){
	 							res.send({"status":"error","msg":"error while inserting the route"});
	 						}else{
	 							   res.send({"status":"success","route":obj});
	 						}
	 					});
	 						}
	 					})
	 					
	 				}
	 			});
	 		// db.collection("locations").find({"location":fromLocation})
	 	}else{
	 		res.send({"status":"error","msg":"some information is missing"});
	 	}
	 }

	 function findMatchResult(req,res,next){
	 	var matchData = req.body;
	 	var distance = 1;

	 	// {type : "Point",coordinates : matchData.start}

	 	// {type : "Point",coordinates : matchData.end}

	 	if((matchData)&&(matchData.startPosition)&&(matchData.endPosition)){

	 	async.parallel({
	 		one:function(callback){
	 			db.collection("locations").find({"location":{ $nearSphere : {$geometry: matchData.startPosition, $maxDistance: (distance * 1000) }}}).toArray(callback)
	 		},
	 		two:function(callback){
	 			db.collection("locations").find({"location":{ $nearSphere : {$geometry: matchData.endPosition, $maxDistance: (distance * 1000) }}}).toArray(callback)
	 		}
	 	},function(err,asyncResult){
	 		if(err){
	 			console.log(err);
	 			res.send({"status":"error","msg":"error while getting the location result"});
	 		}else if((asyncResult)&&(asyncResult.one.length)&&(asyncResult.two.length)){
	 			var fromLocations = asyncResult.one;
	 			var toLocations = asyncResult.two;
	 			var fromLocationIds = underscore.pluck(fromLocations,'_id');
	 			var toLocationIds = underscore.pluck(toLocations,'_id');
	 			db.collection("routes").find({"start_location":{"$in":fromLocationIds},"end_location":{"$in":toLocationIds}}).toArray(function(err1,results){
	 				if(err1){
	 					res.send({"status":"error","msg":"error while getting the data."});
	 				}else if(results.length){
	 					async.eachSeries(results,function(eachResult,callbackone){
	 						console.log("coming here");
	 						eachResult.start_location_info = underscore.find(fromLocations, function(obj) { return obj._id == eachResult.start_location });
	 						eachResult.end_location_info = underscore.find(toLocations,function(obj){ return obj._id == eachResult.end_location });
	 						callbackone();
	 					},function(resultsOne){
	 						res.send({"status":"success","routes":results});
	 					});
	 				}else{
	 					    res.send({"status":"success","routes":[]});
	 				}
	 			});

	 		}else{
	 			res.send({"status":'success',"routes":[]});
	 		}
	 	});
	  }else{
	  	res.send({"status":"error","msg":"start or end location is missing"});
	  }
	 }

	return {
		searchedLocations:searchedLocations,  // searchedlocation
		saveUserLocation:saveUserLocation,    // savelocation
		setLocation:setLocation,
		findNearTaxies:findNearTaxies,
		saveRoute:saveRoute,
		findMatchResult:findMatchResult
	}

})();