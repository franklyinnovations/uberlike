module.exports = (function(){

var uuid = require('node-uuid');
var moment = require('moment');
var async = require('async');
var underscore = require('underscore');
var validator = require('validator');
var geocoderProvider = 'google';
var httpAdapter = 'https';
var extra = {
    apiKey: 'AIzaSyDVksvEMbTZTClxjY-touspszFsJSutiIY', // for Mapquest, OpenCage, Google Premier  // YOUR_API_KEY
    formatter: null         // 'gpx', 'string', ...
};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);


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

	 function saveRouteInfo(req,res,next){
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

	 /*
	 function saveRoutesAndSubRoutes(req,res,next){
	 	var routeData = req.body;
	 	var order = 0;
	 	async.eachSeries(routeData,function(eachSubRoute,subRouteCallback){
	 		async.parallel({
	 			from:function(fromLocationCallback){
	 				db.collection("locations").findOne({"location":eachSubRoute.start_location},function(errFrom,fromLocation){
	 					if(errFrom){
	 						fromLocationCallback(errFrom,null);
	 					}else if(fromLocation){
	 						fromLocationCallback(null,fromLocation);
	 					}else{
	 						var fromLocationObj = {};
	 						fromLocationObj.location  = eachSubRoute.start_location;
	 						fromLocationObj.full_address = eachSubRoute.start_location_address;
	 						fromLocationObj._id = uuid.v4();
	 						db.collection("locations").insert(fromLocationObj,function(fromErr,locationFrom){
	 							if(fromErr){
	 								fromLocationCallback(fromErr,null);
	 							}else{
	 								fromLocationCallback(null,locationFr)
	 							}
	 						})
	 					}
	 				})
	 			},
	 			to:function(toLocationCallback){

	 			}

	 		},function(errLocation,subRouteLocations){
	 			if(errLocation){
	 				subRouteCallback(errLocation);
	 			}else if((subRouteLocations)&&(subRouteLocations.from)&&(subRouteLocations.to)){
	 				db.collection("sub_routes").findOne({"route_id":eachSubRoute.route_id,"start_location":subRouteLocations.from._id,"end_location":subRouteLocations.to_id},function(subErr,subRouteResult){
	 					if(subErr){

	 					}else if(subRouteResult){

	 					}else{

	 					}
	 				});
	 			}else{
	 				subRouteCallback();
	 			}
	 		})
	 	},function(errSubRoute){

	 	});

	 }
	 */


	 function saveTripData(req,res,next){
	 	var tripData = req.body;
	 	if((tripData)&&(tripData.startLocation)&&(tripData.startLocation.location)&&(tripData.endLocation)&&(tripData.endLocation.location)&&(tripData.directionsResult)){
	 		async.parallel({
	 			from:function(fromCallback){
	 				findOrSaveLocation(tripData.startLocation,fromCallback)
	 			},
	 			to:function(toCallback){
	 				findOrSaveLocation(tripData.endLocation,toCallback)
	 			}
	 		},function(tripErrs,locationResults){
	 			if(tripErrs){
	 				res.send({"status":"error","msg":"Some Location information saving or retriving is failed."});
	 			}else if((locationResults)&&(locationResults.from)&&(locationResults.to)){
	 				var startLocationResult = locationResults.from;
	 				var endLocationResult = locationResults.to;
	 				var myTrip = {};
	 					myTrip.start_location = startLocationResult._id;
	 					myTrip.end_location = endLocationResult._id;
	 					myTrip.trip_name = "Trip from "+startLocationResult.full_address+" to "+endLocationResult.full_address;
	 					saveTrip(myTrip,function(tripErr,tripResult){
	 						if(tripErr){
	 							res.send({"status":"error","msg":"Error while handling trip."});
	 						}else{
	 							//resultdata.routes
	 							
	 							var routeResults = [];
	 							async.eachSeries(tripData.directionsResult.routes,function(eachRoute,routeCallback){
	 								var routeObj = {};
	 								routeObj.encripted_line = eachRoute.overview_polyline;
	 								routeObj.trip_id = tripResult._id;

	 								saveRoute(routeObj,function(routeErr,routeResult){
	 									if(routeErr){
	 									routeCallback(routeErr);
	 									}else{
	 										var legorder = 0;
	 										var legResults = [];
	 										var stepResults = [];
	 										async.eachSeries(eachRoute.legs,function(eachLeg,legCallback){
	 											var legObj = {};
	 											legObj.start_location = {};
	 											legObj.end_location = {};
	 											console.log(eachLeg.start_location);
	 											console.log(eachLeg.end_location);
	 											legObj.start_location.location = {"type":"Point","coordinates":[eachLeg.start_location.L,eachLeg.start_location.H]};

//	 											legObj.start_location.location = {"type":"Point","coordinates":[eachLeg.start_location.lng,eachLeg.start_location.lat]};
	 											legObj.start_location.full_address = eachLeg.start_address;
	 											legObj.end_location.location = {"type":"Point","coordinates":[eachLeg.end_location.L,eachLeg.end_location.H]};
	 								 //			legObj.end_location.location = {"type":"Point","coordinates":[eachLeg.end_location.lng,eachLeg.end_location.lat]};
	 											legObj.end_location.full_address = eachLeg.end_address; 	
	 											legObj.route_id = routeResult._id;
	 											legObj.order = legorder;
	 											saveLeg(legObj,function(legErr,legResult){
	 												if(legErr){
	 													legCallback(legErr);
	 												}else{
	 													
	 													async.eachSeries(eachLeg.steps,function(eachStep,stepCallback){
	 														var stepObj = {};
	 														stepObj.leg_id = legResult._id;
	 														stepObj.start_location = eachStep.start_location;
	 														stepObj.end_location = eachStep.end_location;
	 														stepObj.leg_id = legResult._id;
	 														stepObj.encripted_line = eachStep.polyline.points;
	 														saveStep(stepObj,function(stepErr,stepResult){
	 															if(stepErr){
	 																stepCallback(stepErr);
	 															}else{
	 																stepResults.push(stepResult);
	 																stepCallback();
	 															}
	 														});

	 													},function(stepError){
	 														if(stepError){
	 															legCallback(stepError);
	 														}else{
	 															legResult.stepResults = stepResults;
	 															legResults.push(legResult);
	 															legCallback();
	 														}
	 													})
	 												}
	 											})
	 										},function(legError){
	 											if(legError){
	 												routeCallback(legError);
	 											}else{
	 												routeResult.legResults = legResults;
	 												routeResults.push(routeResult);
	 												routeCallback();
	 											}

	 										});
	 									}
	 								})

	 							},function(routeError){
	 								if(routeError){
	 									console.log(routeError);
	 									res.send({"status":"error","msg":"error While handling route"});
	 								}else{
	 									tripResult.routeResults = routeResults;
	 									res.send({"status":"success",resultObj:tripResult});
	 								}

	 							});
	 						}
	 					}); 

	 			}else{
	 				res.send({"status":"error","msg":"Some Location information inserting failed"});
	 			}
	 		})
	 	}else{
	 		res.send({"status":"error","msg":"Some Trip Data is missing."});
	 	}
	 }

	 function saveTrip(tripObj,callback){
	 	db.collection("trips").findOne({"start_location":tripObj.start_location,"end_location":tripObj.end_location},function(tripErr,tripResult){
	 		if(tripErr){
	 			callback(tripErr,null);
	 		}else if(tripResult){
	 			callback(null,tripResult)
	 		}else{
	 			tripObj._id = uuid.v4();
	 			db.collection("trips").insert(tripObj,function(tErr,insTripResult){
	 				if(tErr){
	 					callback(tErr,null);
	 				}else{
	 					callback(null,tripObj);
	 				}
	 			})
	 		}
	 	})
	 }

	 function saveLeg(legObj,callback){
	 	console.log(legObj);
	 	                  async.parallel({
	 									fromLeg:function(fromLegCallback){
	 										findOrSaveLocation(legObj.start_location,fromLegCallback)
	 									},
	 									toLeg:function(toLegCallback){
	 									    findOrSaveLocation(legObj.end_location,toLegCallback)
	 									}
	 								},function(legErr,legResults){
	 									if(legErr){
	 										callback(legErr,null);
	 									}else{
	 										var legData = {};
	 										legData._id = uuid.v4();
	 										legData.route_id = legObj.route_id;
	 										legData.start_location = legResults.fromLeg._id;
	 										legData.end_location = legResults.toLeg._id;
	 										legData.order = legObj.order;
	 										legData.leg_from = "From "+legResults.fromLeg.full_address+" to "+legResults.toLeg.full_address;
	 										db.collection("legs").insert(legData,function(legErr,legInsResult){
	 											if(legErr){
	 												callback(legErr,null);
	 											}else{
	 												callback(null,legData);
	 											}
	 										})
	 									}
	 								});

	 }

	 function saveStep(stepObj,callback){
	 	console.log(stepObj);
	 	async.parallel({
	 		fromStep:function(fromStepCallback){
	 			var fromLocationObj = {};
	 			fromLocationObj.location = {"type":"Point","coordinates":[stepObj.start_location.L,stepObj.start_location.H]};
	 			fromLocationObj.full_address = ""; 
	 			findOrSaveLocation(fromLocationObj,fromStepCallback);
	 		 //	geocoder.reverse({lat:45.767, lon:4.833}
  /*
  geocoder.reverse({"lat":stepObj.start_location.lat,"lon":stepObj.start_location.lng}, function ( errs, geocodeData ) {
  if(errs){
        fromStepCallback(errs,null);
  }else if((geocodeData)&&(geocodeData.length)){
            var fromLocationObj = {};
            fromLocationObj.location = {
                "type":"Point",
                "coordinates":[geocodeData[0].longitude,geocodeData[0].latitude]
            };
            fromLocationObj.full_address = geocodeData[0].formattedAddress;
            findOrSaveLocation(fromLocationObj,fromStepCallback);
	 		}else{
	 			fromStepCallback("error while geocoding",null);
	 		}
	 	});
*/
	 		},
	 		toStep:function(toStepCallback){
	 			var toLocationObj = {};
	 			toLocationObj.location = {"type":"Point","coordinates":[stepObj.end_location.L,stepObj.end_location.H]};
	 			toLocationObj.full_address = "";
	 			findOrSaveLocation(toLocationObj,toStepCallback);
	 			/*
	 			geocoder.reverse({"lat":stepObj.end_location.lat,"lon":stepObj.end_location.lng}, function ( errs, geocodeData ) {
  if(errs){
        toStepCallback(errs,null);
  }else if((geocodeData)&&(geocodeData.length)){
            var toLocationObj = {};
            toLocationObj.location = {
                "type":"Point",
                "coordinates":[geocodeData[0].longitude,geocodeData[0].latitude]
            };
            toLocationObj.full_address = geocodeData[0].formattedAddress;
            findOrSaveLocation(toLocationObj,toStepCallback);
	 		}else{
	 			toStepCallback("error while geocoding",null);
	 		}
	 	});
*/
	 		}
	 	},function(err,stepResults){
	 		if(err){
	 			callback(err,null)
	 		}else{
	 			console.log(stepResults);
	 			var stepData = {};
	 			stepData._id = uuid.v4();
	 			stepData.start_location = stepResults.fromStep._id;
	 			stepData.end_location = stepResults.toStep._id;
	 			stepData.leg_id = stepObj.leg_id;
	 			stepData.step_name = "From "+stepResults.fromStep.full_address+" to "+stepResults.toStep.full_address;
	 			stepData.encripted_line = stepObj.encripted_line;
	 			db.collection("steps").insert(stepData,function(stepError,stepResult){
	 				if(stepError){
	 					callback(stepError,null);
	 				}else{
	 					callback(null,stepData);
	 				}
	 			});

	 		}
	 	})
	 }

	 function saveRoute(routeObj,callback){

	 	db.collection("routes").find({"trip_id":routeObj.trip_id}).toArray(function(routeErr,routeResult){
	 		if(routeErr){
	 			callback(routeErr,null);
	 		}else{
	 			routeObj.order = routeResult.length || 0;
	 			routeObj._id = uuid.v4();
	 			db.collection("routes").insert(routeObj,function(routeInsErr,routeInsResult){
	 				if(routeInsErr){
	 					callback(routeInsErr,null);
	 				}else{
	 					callback(null,routeObj);
	 				}
	 			});
	 		}
	 	});
	 }

	 function findOrSaveLocation(locationObj,callback){
	 	db.collection("locations").findOne({"location":locationObj.location},function(err,locationResult){
	 		if(err){
	 			callback(err,null);
	 		}else if(locationResult){
	 			callback(null,locationResult);
	 		}else{
	 			locationObj._id = uuid.v4();
	 			db.collection("locations").insert(locationObj,function(errOne,result){
	 				if(errOne){
	 					callback(errOne,null);
	 				}else{
	 					callback(null,locationObj);
	 				}
	 			})
	 		}
	 	})
	 }

	return {
		searchedLocations:searchedLocations,  // searchedlocation
		saveUserLocation:saveUserLocation,    // savelocation
		setLocation:setLocation,
		findNearTaxies:findNearTaxies,
		saveRouteInfo:saveRouteInfo,
		findMatchResult:findMatchResult,
		saveTripData:saveTripData
	}

})();