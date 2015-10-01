var passengerController = function(){

var uuid = require('node-uuid');
var moment = require('moment');
var async = require('async');
var underscore = require('underscore');
var validator = require('validator');
var request = require('request');



var matchShareModel = require('../Models/matchShare')();
var taxiLocationModel = require('../Models/taxiLocation')();
var tripModel = require('../Models/trip')();
var userModel = require('../Models/user')();

var geocoderProvider = 'google';
var httpAdapter = 'https';
var extra = {
	apiKey: 'AIzaSyDVksvEMbTZTClxjY-touspszFsJSutiIY', // for Mapquest, OpenCage, Google Premier  // YOUR_API_KEY
	formatter: null         // 'gpx', 'string', ...
};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
var polyline = require('polyline');


 //console.log("passenger moment");
 //console.log(moment("2015-04-13T06:06:08+00:00","YYYY-MM-DDTHH:mm:ssZ").utc().format());

var host = "http://localhost";
	
		  console.log( moment(moment("2015-09-28","YYYY-MM-DD").format("YYYY-MM-DD")+"T"+moment("6:15 pm","hh:mm a").format("HH:mm:ss")).format() );


	  // db.locations.find({ location : { $nearSphere : [ 78.486671,17.385044 ], $maxDistance: (9/6371) } }).pretty();

	 function findNearTaxies(req,res,next){
		var fromLocation = req.body;
		if((fromLocation)&&(fromLocation.coordinates)){
			var distance = fromLocation.distance || 1; // 10
		 // var withInTime = moment.utc().add(5, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
		 //  var taxiResults = [];
			var moreTime = moment.utc().subtract('5','minutes').format(); // YYYY-MM-DDTHH:mm:ssZ

			taxiLocationModel.get({"location" : { $nearSphere : {$geometry: {type : "Point",coordinates : fromLocation.coordinates}, $maxDistance: (distance * 1000) }},"isOccupied":false},function(err2,taxiResult){
							if(err2){
								console.log(err2);
								res.status(500);
								res.send({"status":"error","msg":"error while finding taxi location"});
							//  callback(err2,null);
							}else{
								console.log(taxiResult);
								if((taxiResult)&&(taxiResult.length)){
							 res.status(200);
							 res.send({"status":"success","taxies":taxiResult});
							}else{
							 // callback(null,null);
							 res.status(200);
							 res.send({"status":"success","taxies":[]});
							}
							}
						});
		}else{
			res.status(400);
			res.send({"status":"error","msg":"Some required information is missing."});
		}
	 }

	 function poliLineDecode(req,res,next){
		var data = req.body;
		db.collection("steps").findOne({},function(err,stepResult){
			if(err){
				res.status(500);
				res.send({"status":"error","msg":"error while getting steps"});
			}else{
				var decodedData = polyline.decode("s}gwF~eibMOAwEUuCMFoCTwK@W@m@");   // stepResult.encripted_line
				res.status(200);
				res.send({"status":"success","decodedObj":decodedData});
			}
		});
	 }

	 function saveSearchData(req,res,next){
		var tripData = req.body;
		if((tripData)&&(tripData.startLocation)&&(tripData.startLocation.location)&&(tripData.endLocation)&&(tripData.endLocation.location)&&(tripData.directionsResult)&&(tripData.timeToLeave)&&(tripData.user_id)){
			var tripObj = {};
			tripObj.type = "Trip";
			tripObj.user_id = tripData.user_id;
			tripObj.startLocation = tripData.startLocation.location;
			tripObj.endLocation = tripData.endLocation.location;
			tripObj.trip_details = "From "+tripData.startLocation.full_address+" to "+tripData.endLocation.full_address;
			tripObj.start_address = tripData.startLocation.full_address;
			tripObj.end_address = tripData.endLocation.full_address;
			tripObj.start_time = moment(tripData.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().format();  // "2015-04-13T06:06:08+00:00"
		 // tripObj.start_time = moment.utc(tripData.timeToLeave).format();
			tripObj.created_time = moment.utc().format();
			tripModel.getOne({"startLocation":tripObj.startLocation,"endLocation":tripObj.endLocation,"user_id":tripObj.user_id,"start_time":tripObj.start_time},function(errTrip,tripResult){
				if(errTrip){
					res.status(500);
					res.send({"status":"error","msg":"Error while getting the trip results."});
				}else if(tripResult){
					res.status(200);
			res.send({"status":"success","tripObj":tripResult});
				}else{
					tripObj._id = uuid.v4();
			tripObj.Routes = [];
		//  var routes = [];
			async.eachSeries(tripData.directionsResult,function(eachRoute,routeCallback){
			   var routesObj = {};
			   routesObj.type = "Route";
			   //routesObj.coordinates = eachRoute.overview_polyline;
			   routesObj.Legs = [];
				async.eachSeries(eachRoute.legs,function(eachLeg,legCallback){
					var legObj = {};
					legObj.type = "Leg";
					legObj.startLocation = {"type":"Point","coordinates":[eachLeg.start_location.L,eachLeg.start_location.H]};
					legObj.endLocation = {"type":"Point","coordinates":[eachLeg.end_location.L,eachLeg.end_location.H]};
					legObj.distance = eachLeg.distance;
					legObj.duration = eachLeg.duration;
					legObj.start_address = eachLeg.start_address;
					legObj.end_address = eachLeg.end_address;
					legObj.Steps = [];
					async.eachSeries(eachLeg.steps,function(eachStep,stepCallback){
						var stepObj = {};
						stepObj.type = "Step";
						stepObj.distance = eachStep.distance;
						stepObj.duration = eachStep.duration;
						stepObj.startLocation = {"type":"Point","coordinates":[eachStep.start_location.L,eachStep.start_location.H]};
						stepObj.endLocation = {"type":"Point","coordinates":[eachStep.end_location.L,eachStep.end_location.H]};
						stepObj.geometry ={};
								stepObj.geometry.type = "MultiLineString";
								stepObj.geometry.coordinates = [];
						decripted_line(eachStep.polyline.points,function(decriptedLine){
							if((decriptedLine)&&(decriptedLine.length)){
								stepObj.geometry.coordinates = decriptedLine;
								legObj.Steps.push(stepObj);
						stepCallback();
							}else{
								//legObj.steps.push(stepObj);
						stepCallback();
							}
						});
					 // stepObj.encripted_line = polyline.points;
						
					},function(stepErr){
						routesObj.Legs.push(legObj);
						legCallback();
					});

				},function(legErr){
					tripObj.Routes.push(routesObj);
					routeCallback();
				});
			},function(errRoute){
				 tripModel.insert(tripObj,function(err,tripResult){
					if(err){
						res.status(500);
						res.send({"status":"error","msg":"error while inserting the trip"});
					}else{
						res.status(200);
						res.send({"status":"success","tripObj":tripObj});
					}
				})
			});
					}
			});

		}else{
			res.status(200);
			res.send({"status":"error","msg":"Some information is missing"});
		}
	 }

	 function decripted_line(poliLine,callback){
		var decodedOutput = polyline.decode(poliLine);
		var changedData = [];
		async.eachSeries(decodedOutput,function(eachLine,decodeCallback){
			changedData.push([eachLine[1],eachLine[0]]);
			decodeCallback();
		},function(err){
			callback(changedData);
		});
	 }

	 function findMatches(matchObj,callback){
		var distance = 1;
		var start_time = moment(matchObj.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().subtract('10','minutes').format();//matchObj.start_time.subtract('10','minutes').format(); // moment.utc()
		var end_time = moment.utc(matchObj.timeToLeave).add('10','minutes').format();  // moment.utc() 
		 tripModel.get({"startLocation":{ $nearSphere : {$geometry: matchObj.startLocation, $maxDistance: (distance * 1000) }},"endLocation":{ $nearSphere : {$geometry: matchObj.endLocation, $maxDistance: (distance * 1000) }},"start_time":{$gte:start_time,$lte:end_time}},function(tripErr,tripResults){
			if(tripErr){
				callback(tripErr,null);
			}else{
				callback(null,tripResults);
			}
		});
	 }

	 function findSimillarRoutes(matchData,callback){
		var distance = 1;

	 }

	 function findMatchedTrips(req,res,next){
		var routes = req.body;
		var distance = 1;
		var start_time = moment(routes.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().subtract('10','minutes').format();
		var end_time = moment(routes.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().add('10','minutes').format();
		var resultTrips = [];

		//   "start_time":{$gte:start_time,$lt:end_time},"user_id":{"$ne":user_id}

		async.parallel({
			start:function(startCallback){
			  tripModel.get({"startLocation" : { $nearSphere : {$geometry: routes.startLocation, $maxDistance: (distance * 1000) }}},startCallback);
			},
			end:function(endCallback){
			  tripModel.get({"endLocation": { $nearSphere : {$geometry: routes.endLocation, $maxDistance: (distance * 1000) }}},endCallback);
			}
		},function(errTrip,matchResult){
			console.log(matchResult);
			if(errTrip){
				console.log("Error:--------");
				console.log(errTrip);
				res.status(500);
				res.send({"status":"error","msg":"Error while getting the trip data"});
			}else if((matchResult)&&(matchResult.start)&&(matchResult.end)&&(matchResult.start.length)&&(matchResult.end.length)){
				var startLocation_ids = underscore.pluck(matchResult.start,'_id');
				var endLocation_ids = underscore.pluck(matchResult.end,'_id');
				console.log(startLocation_ids);
				console.log(endLocation_ids);
				var matchids = underscore.intersection(startLocation_ids,endLocation_ids);
				async.eachSeries(matchids,function(eachMatch_id,tripCallback){
				 var matchObj = underscore.find(matchResult.start, function(obj) { return obj._id == eachMatch_id });
					userModel.getById(matchObj.user_id,function(err,userResult){
						if(err){
							tripCallback(err);
						}else{
							matchObj.userResult = userResult;
							resultTrips.push(matchObj);
							tripCallback();
						}
					});
				},function(tErr){
					if(tErr){
						res.status(500);
						res.send({"status":"error","msg":"Error while getting the user information."});
					}else{
						res.status(200);
						res.send({"status":"success","matches":resultTrips});
					}
				});
			}else{
				res.status(200);
				res.send({"status":"success","matches":resultTrips});
			}
		});
	 }

	 function findUserById(user_id,callback){
		db.collection("user").findOne({"_id":user_id},callback);
	 }

	 function sendShareMessage(req,res,next){
		var shareData = req.body;
		if(shareData.trip_id){
			var trip_id = shareData.trip_id;
			var user_id = shareData.user_id;
			db.collection("matches").findOne({"trip_id":trip_id,"user_id":user_id},function(errMatch,MatchResults){
				if(errMatch){
					res.status(500);
					res.send({"status":"error","msg":"error while finding the result"});
				}else if(MatchResults){
					res.status(409);
					res.send({"status":"error","msg":"You already sended request to these user"});
				}else{
					tripModel.getOne({"_id":shareData.trip_id},function(errr,tripDetails){
			if(errr){
				res.status(500);
				res.send({"status":"error","msg":"error while getting the trip data."});
			}else if(tripDetails){
				userModel.getById(tripDetails.user_id,function(userErr,userResult){
					if(userErr){
						res.status(500);
						res.send({"status":"error","msg":"error while getting the user information"});
					}else if(userResult){
						var matchObj = {};
						matchObj._id = uuid.v4();
						matchObj.trip_id = tripDetails._id;
						matchObj.user_id = shareData.user_id;
						console.log(tripDetails.start_address);
						console.log(tripDetails.end_address);
						var fromResult = tripDetails.start_address.split(",");
						var toResult = tripDetails.end_address.split(",");
						var url = host+"/"+fromResult[fromResult.length - 3].trim()+"/share-taxi/"+fromResult[fromResult.length - 4].trim()+"-"+toResult[toResult.length - 4].trim()+"/"+matchObj._id;
						async.parallel({
							sms:function(smsCallback){
								var messagetext = "Dear "+userResult.username+"Some one want's to share your taxi between"+fromResult[fromResult.length - 4]+" to "+toResult[toResult.length - 4]+"follow url "+url;
				 var mobilenumber = userResult.phonenumber; 
				 sms(mobilenumber,messagetext,smsCallback);
							},
							email:function(emailCallback){
								var emailValues={};
		emailValues.username = userResult.username;
	 // emilValues.email = data.email;
	 emailValues.from = tripDetails.start_address;
	 emailValues.to = tripDetails.end_address;
	 emailValues.start_time = tripDetails.start_time;
	 emailValues.url = url;
	 // console.log(emilValues);
		app.render("share-ride",emailValues,function(error,html){
			if(error){
				console.log(error,html);
				emailCallback(error,null);
			}else{
				var emailDetails = {};
			emailDetails.email = userResult.email;
			emailDetails.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
			emailDetails.subject = "Share Your trip";
			 email(emailDetails,emailCallback);
							}
						});
	 }
						},function(err,sendResult){
							if(err){
								console.log(err);
								res.status(500);
								res.send({"status":"error","msg":"Error while sending details sms and email","err":err});
							}else{

								db.collection("matches").insert(matchObj,function(matchErr,matchResult){
									if(matchErr){
										res.status(500);
										res.send({"status":"error","msg":"Error in match result"});
									}else{
										res.send(200);
										res.send({"status":"success","msg":"you'r share request is processed"});
									}
								});
							}
						});
					}else{
						res.status(404);
						res.send({"status":"error","msg":"user does not exists."});
					}
				});
			}else{
				res.status(404);
				res.send({"status":"error","msg":"trip does not exists"});
			}
		});
				}
			})
		
		}else{
			res.status(400);
			res.send({"status":"error","msg":"Trip data is missing"});
		} 
	 }

	 function contactPage(req,res,next){
		var match_id = req.params.match_id;
		if(match_id){
			db.collection("matches").findOne({"_id":match_id},function(matchErr,shareResults){
				if(matchErr){
					res.status(500);
					res.send({"status":"error","msg":"error while getting the information"});
				}else if(shareResults){
					 userModel.getOne({"_id":shareResults.user_id},function(userErr,userResult){
						if(userErr){
							res.status(500);
							res.send({"status":"error","msg":"Error while getting user info"});
						}else if(userResult){
							shareResults.shareUser = userResult;
							shareResults.imageUrl = host+'/images/'+userResult.image_url;
							var redirectUrl = req.url;
							console.log(redirectUrl);
							if(req.cookies.redirectUrl){
								res.clearCookie('redirectUrl');
							}
							if(req.cookies.user){
								shareResults.layout = 'share-contact';
						  //        matchedInfo.layout = 'share-contact';
								res.render('share-result',shareResults);
							}else{
								res.cookie('redirectUrl',redirectUrl);
								res.redirect("/");
							}
						}else{
							res.status(404);
							res.send({"status":"error","msg":"User does not exists"});
						}
					});
				}else{
					res.status(404);
					res.send({"status":"error","msg":"your requested url does not match"});
				}
			});
		}else{
			res.status(404);
			res.send({"status":"error","msg":"Some match information is missing"});
		}
	 }

	 function getMatchShareUserInfo(req,res,next){
		var shareObj = req.body;
		async.parallel({
						shareUser:function(shareCallback){
							userModel.getOne({"_id":shareObj.user_id},shareCallback);
						},
						tripUser:function(tripCallback){
							 tripModel.getOne({"_id":shareObj.trip_id},function(tripErr,tripResult){
								if(tripErr){
									tripCallback(tripErr,null);
								}else if(tripResult){
									userModel.getOne({"_id":tripResult.user_id},function(uErr,userResult){
										if(uErr){
											tripCallback(uErr,null);
										}else if(userResult){
											var tripObj = {};
											tripObj = tripResult;
											tripObj.userObj = userResult;
											tripCallback(null,tripObj);
										}
									})
								}else{
									tripCallback(null,null);
								}
							});
						}
					},function(shareErr,matchedInfo){
						if(shareErr){
							res.status(500);
							res.send({"status":"error","msg":"Error while getting the requested user information","err":shareErr});
						}else if((matchedInfo)&&(matchedInfo.shareUser)&&(matchedInfo.tripUser)){
							res.status(200);
							res.send({"status":"success","shareObj":matchedInfo});
						}
					});
	 }

	 // directions url : // 'https://maps.googleapis.com/maps/api/directions/json?origin=hiihi&destination=ihihih&waypoints=iigihi&key=AIzaSyDVksvEMbTZTClxjY-touspszFsJSutiIY';

		function searchData(req,res){
			var shareData = req.body;
			if(shareData){
				if(shareData.from){
					if(shareData.to){
						if(shareData.start_date){
							if(shareData.start_time){
								if(shareData.user_id){
									shareData.timeToLeave = moment(moment(shareData.start_date,"DD MMMM, YYYY").format("YYYY-MM-DD")+"T"+moment(shareData.start_time,"hh:mm a").format("HH:mm:ss")).utc().format(); // moment(shareData.start_date+"T"+moment(shareData.start_time,"hh:mm A").format("HH:mm:ss")).format();

var x = 1;

geocoder.geocode(shareData.from, function ( errs, geocodeData ) {
	if((errs)||(!(geocodeData)||(!geocodeData.length))){
		errs = errs || "Error while finding the geocode";
		res.status(500);
		sendError(errs,"Error while geocoding",res);
		
	}else{
		shareData.startLocation = {
				"type":"Point",
				"coordinates":[geocodeData[0].longitude,geocodeData[0].latitude]
			}; 
			geocoder.geocode(shareData.to,function(erre,geoEndData){
	if((erre)||(!geoEndData)||(!(geoEndData.length))){
			erre = erre || "Error while geocoding";
		res.status(500);
		sendError(erre,"Error while geocoding",res);

 }else{
			shareData.endLocation = {
				"type":"Point",
				"coordinates":[geoEndData[0].longitude,geoEndData[0].latitude]
			};
			async.parallel({
	insertMatch:function(shareInsertCallback){
		console.log("I am from insertLocation");
		console.log(shareData.startLocation);
	console.log(shareData.endLocation);
		checkNewUser(shareData,shareInsertCallback);
	},
	matchResults:function(matchCallback){
		console.log("I am from end Location");
		console.log(shareData.startLocation);
	console.log(shareData.endLocation);
		mathedRides(shareData,matchCallback);
	}
},function(matchErr,finalResult){
if(matchErr){
	res.status(500);
	sendError(matchErr,"Error while getting matches",res);
}else if((finalResult)&&(finalResult.matchResults)){
	userModel.getById(finalResult.insertMatch.user_id,function(err,userObj){
		if(err){
			res.status(500);
			sendError(err,"Error while finding the result",res);
		}else if(userObj){
			finalResult.insertMatch.userResult = userObj;
			res.status(200);
			res.send({"results":finalResult.matchResults});   //  "status":"success","matches":finalResult.matchResults,"matchObj":finalResult.insertMatch
		}else{
			res.status(404);
			sendError(" ","User does not exists",res);
		}
	});
}else{
 // sendError(" ","Error while finding matches",res);
 res.status(200);
 res.send({"results":[]});
}
});
	}
});

	}
});

								}else{
									   res.status(400);
									   sendError(" ","userid is missing",res);
								}
							}else{
								res.status(400);
								sendError(" ","start time is missing",res);
							}
						}else{
							res.status(400);
							sendError(" ","Start date is missing",res);
						}
					}else{
						res.status(400);
						sendError(" ","End location is missing",res);
					}
				}else{
					res.status(400);
					sendError(" ","Start Location is missing",res);
				}
			}else{
				res.status(400);
				sendError(" ","Missing body data",res);
			}
		}



		function checkNewUser(shareInfo,callback){

			matchShareModel.getOne({"startLocation":shareInfo.startLocation,"endLocation":shareInfo.endLocation,"start_time":shareInfo.timeToLeave,"user_id":shareInfo.user_id},function(matchError,matchResult){
				if(matchError){
					callback(matchError,null);
				}else if(matchResult){
					var updateObj = {};
						updateObj._id = matchResult._id;
					if(matchResult.split_amount){
						if(shareInfo.splitAmount){
							if((matchResult.split_amount == shareInfo.splitAmount)){
						callback(null,matchResult);
					}else{
						updateObj.car = 1;
						updateObj.split_amount = shareInfo.splitAmount;
						// update it in database
						updateMatches(updateObj,callback);
						}
					}else{
						updateObj.car = 0;
						updateObj.split_amount = 0;
						//update it
						updateMatches(updateObj,callback);
					}
					}else if(shareInfo.splitAmount){
						updateObj.car = 1;
						updateObj.split_amount = shareInfo.splitAmount;
						// update in db
						updateMatches(updateObj,callback);
					}else{
						callback(null,matchResult);
					}

				}else{
						var url = "https://maps.googleapis.com/maps/api/directions/json?origin="+shareInfo.from+"&destination="+shareInfo.to+"&key=AIzaSyDVksvEMbTZTClxjY-touspszFsJSutiIY";   // &waypoints=iigihi
									request(url, function (error, response, directIonResult) {
										if(directIonResult){
											directIonResult = JSON.parse(directIonResult);
										}
  if (!error &&  (response.statusCode == 200) && (directIonResult) && (directIonResult.status == "OK")) {


  //  res.send(directIonResult);

			var tripObj = {};
			tripObj.type = "Trip";
			tripObj.user_id = shareInfo.user_id;
			tripObj.startLocation =   shareInfo.startLocation; //  tripData.startLocation.location;
			tripObj.endLocation =     shareInfo.endLocation; // tripData.endLocation.location;
			tripObj.trip_details = "From "+shareInfo.from+" to "+shareInfo.to;
			tripObj.start_address = shareInfo.from;
			tripObj.end_address = shareInfo.to;  //tripData.endLocation.full_address;
			tripObj.start_time = shareInfo.timeToLeave;//moment(tripData.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().format();  // "2015-04-13T06:06:08+00:00"
		 // tripObj.start_date = shareData.start_date;
		 // tripObj.start_time = moment.utc(tripData.timeToLeave).format();
			tripObj.created_time = moment.utc().format();
			tripObj.split_amount = shareInfo.splitAmount;
			if(tripObj.split_amount){
			tripObj.car = 1;
			}else{
			tripObj.car = 0;
			}
		tripObj._id = uuid.v4();
			tripObj.Routes = [];
		//  var routes = [];
			async.eachSeries(directIonResult.routes,function(eachRoute,routeCallback){
			   var routesObj = {};
			   routesObj.type = "Route";
			   //routesObj.coordinates = eachRoute.overview_polyline;
			   routesObj.Legs = [];
				async.eachSeries(eachRoute.legs,function(eachLeg,legCallback){
					var legObj = {};
					legObj.type = "Leg";
					legObj.startLocation = {"type":"Point","coordinates":[eachLeg.start_location.lng,eachLeg.start_location.lat]};
					legObj.endLocation = {"type":"Point","coordinates":[eachLeg.end_location.lng,eachLeg.end_location.lat]};
					legObj.distance = eachLeg.distance;
					legObj.duration = eachLeg.duration;
					legObj.start_address = eachLeg.start_address;
					legObj.end_address = eachLeg.end_address;
					legObj.Steps = [];
					async.eachSeries(eachLeg.steps,function(eachStep,stepCallback){
						var stepObj = {};
						stepObj.type = "Step";
						stepObj.distance = eachStep.distance;
						stepObj.duration = eachStep.duration;
						stepObj.startLocation = {"type":"Point","coordinates":[eachStep.start_location.lng,eachStep.start_location.lat]};
						stepObj.endLocation = {"type":"Point","coordinates":[eachStep.end_location.lng,eachStep.end_location.lat]};
						stepObj.geometry ={};
								stepObj.geometry.type = "MultiLineString";
								stepObj.geometry.coordinates = [];
						decripted_line(eachStep.polyline.points,function(decriptedLine){
							if((decriptedLine)&&(decriptedLine.length)){
								stepObj.geometry.coordinates = decriptedLine;
								legObj.Steps.push(stepObj);
						stepCallback();
							}else{
								//legObj.steps.push(stepObj);
						stepCallback();
							}
						});
					 // stepObj.encripted_line = polyline.points;
						
					},function(stepErr){
						routesObj.Legs.push(legObj);
						legCallback();
					});

				},function(legErr){
					tripObj.Routes.push(routesObj);
					routeCallback();
				});
			},function(errRoute){
				 matchShareModel.insert(tripObj,function(err,tripResult){
					if(err){
						callback(err,null);
					 // res.send({"status":"error","msg":"error while inserting the trip"});
					}else{
					 // res.send({"status":"success","tripObj":tripObj});
					 callback(null,tripObj);
					}
				});
			});
  }else{
  //    console.log(response);
	console.log(response.statusCode);
	console.log(directIonResult.status);
  //    console.log(directIonResult);
	var errMsg = error || directIonResult.status;
  //    sendError(errMsg,"Error while getting the directions",res);
		callback(errMsg,null);
  }
});
				}
			});
		}

		function mathedRides(matchData,callback){
			console.log(matchData.startLocation);
			console.log(matchData.endLocation);
			var distance = 1;
		var start_time = moment(matchData.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().subtract('10','minutes').format();
		var end_time = moment(matchData.timeToLeave,"YYYY-MM-DDTHH:mm:ssZ").utc().add('10','minutes').format();
		var resultTrips = [];

		// "start_time":{$gte:start_time,$lt:end_time},"user_id":{"$ne":user_id}

		async.parallel({
			start:function(startCallback){
				matchShareModel.getRestrictFields({"startLocation" : { $nearSphere : {$geometry: matchData.startLocation, $maxDistance: (distance * 1000) }}},{"trip_details":false,"Routes":false},startCallback);
			},
			end:function(endCallback){
				matchShareModel.getRestrictFields({"endLocation": { $nearSphere : {$geometry: matchData.endLocation, $maxDistance: (distance * 1000) }}},{"trip_details":false,"Routes":false},endCallback);
			}
		},function(errTrip,matchResult){
			console.log(matchResult);
			if(errTrip){
				console.log("Error:--------");
				console.log(errTrip);
			 // res.send({"status":"error","msg":"Error while getting the trip data"});
				callback(errTrip,null);
			}else if((matchResult)&&(matchResult.start)&&(matchResult.end)&&(matchResult.start.length)&&(matchResult.end.length)){
				var startLocation_ids = underscore.pluck(matchResult.start,'_id');
				var endLocation_ids = underscore.pluck(matchResult.end,'_id');
				console.log(startLocation_ids);
				console.log(endLocation_ids);
				var matchids = underscore.intersection(startLocation_ids,endLocation_ids);
				var resultObj = {};
				async.eachSeries(matchids,function(eachMatch_id,tripCallback){
				 var matchObj = underscore.find(matchResult.start, function(obj) { return obj._id == eachMatch_id });
				 if(matchObj){
					resultObj.id = matchObj._id;
					resultObj.rideType = "taxiBooked";  // noTaxiBooked // matchObj.car;
					resultObj.startAddress = matchObj.start_address;
					resultObj.startLocation ={"lat": matchObj.startLocation.coordinates[1],"lng":matchObj.startLocation.coordinates[0] };
					resultObj.endAddress = matchObj.end_address;
					resultObj.endLocation = {"lat":matchObj.endLocation.coordinates[1],"lng":matchObj.endLocation.coordinates[0]};
					resultObj.currentLocation = resultObj.startLocation;
					resultObj.cabService = "Uber";
					resultObj.cabServiceLogo = host+"/images/uberLogo.jpg";
					resultObj.carType = "Indica A/C";
					resultObj.startDate = moment(matchObj.start_time,"YYYY-MM-DDTHH:mm:ssZ").format("DD MMMM, YYYY");
					resultObj.startTime = moment(matchObj.start_time,"YYYY-MM-DDTHH:mm:ssZ").format("hh:mm a");
					userModel.getOneRestricted({"_id":matchObj.user_id},{"_id":true,"provider_id":true,"username":true,"email":true,"phonenumber":true,"image_url":true},function(err,userResult){
						if(err){
							tripCallback(err);
						}else{
							//matchObj.userResult = userResult;
							//console.log(userResult);
							resultObj.initiator = {};
							resultObj.initiator.id = userResult._id;
							resultObj.initiator.email = userResult.email;
							resultObj.initiator.firstName = userResult.firstName;
							resultObj.initiator.lastName = userResult.lastName;
							resultObj.initiator.mobileNumber = userResult.phonenumber;
							resultObj.initiator.gender = userResult.gender;
							resultObj.initiator.facebookId = userResult.provider_id;
							resultObj.initiator.profilePicture = host+"/images/"+userResult.image_url;
							resultObj.passengers = [];
							var obj = {
		  "id":"4535454554",
		  "facebookId":"45345453525454254543545",
		  "firstName":"Setu",
		  "lastName":"Saurabh",
		  "email":"setu@rideshare.co",
		  "mobileNumber":"null",
		  "gender":"male",
		  "profilePicture":"http:/rideshare.co/images/45345453525454254543545.jpg"
		};
							var obj1 = {
		  "id":"4535454554",
		  "facebookId":"45345453525454254543545",
		  "firstName":"Mannat",
		  "lastName":"Saini",
		  "email":"mannat@rideshare.co",
		  "mobileNumber":"null",
		  "gender":"male",
		  "profilePicture":"http:/rideshare.co/images/45345453525454254543545.jpg"
		};
							resultObj.totalSeats = 4;
							resultObj.passengers.push(obj);
							resultObj.passengers.push(obj1);
							resultObj.availableSeats = resultObj.totalSeats - resultObj.passengers.length;
							resultObj.price = matchObj.split_amount;
							resultObj.savings = (resultObj.price) - ((resultObj.price * resultObj.availableSeats)/(resultObj.totalSeats - resultObj.availableSeats + 1)); 
							resultTrips.push(resultObj);
							tripCallback();
						}
					});
				 }
				 
					/*
					   findUserById(matchObj.user_id,function(err,userResult){
						if(err){
							tripCallback(err);
						}else{
							matchObj.userResult = userResult;
							resultTrips.push(matchObj);
							tripCallback();
						}
					});
				*/
				},function(tErr){
					if(tErr){
						callback(tErr,null);
					}else{

				 //     res.send({"status":"success","matches":resultTrips});
						callback(null,resultTrips);
					}
				});
			}else{
			   //   res.send({"status":"success","matches":resultTrips});
					   callback(null,resultTrips);
			}
		});
		}

		function sendError(err,msg,res){
			res.send({"status":"error","msg":msg,"err":err});
		}

		function updateMatches(matchObj,callback){
			var car = matchObj.car;
			var split_amount = matchObj.split_amount;
			matchShareModel.update({"_id":matchObj._id},{"car":car,"split_amount":split_amount},callback);
		}

		// var cron = require('node-schedule');

	return {
 //     searchedLocations:searchedLocations,  // searchedlocation
 //     saveUserLocation:saveUserLocation,    // savelocation
 //     setLocation:setLocation,
		findNearTaxies:findNearTaxies,
 //     saveRouteInfo:saveRouteInfo,
 //     findMatchResult:findMatchResult,
 //     saveTripData:saveTripData,
		poliLineDecode:poliLineDecode,
		saveSearchData:saveSearchData,
		findMatchedTrips:findMatchedTrips,
		sendShareMessage:sendShareMessage,
		contactPage:contactPage,
		searchData:searchData,
		getMatchShareUserInfo:getMatchShareUserInfo
	}
};
module.exports = passengerController;