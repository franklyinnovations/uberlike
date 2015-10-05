var cronjobs = function(){

	var matchShareModel = require("../models/matchShare")();
	var userModel = require("../models/user")();
	var emailUserModel = require("../models/emailUser")();
	var moment = require('moment');
	var async = require('async');
	var underscore = require("underscore");
	var uuid = require('node-uuid');

	function sendEmailForMatching(){
	var start_time = moment.utc().format("YYYY-MM-DDT00:00:00z");
	var end_time = moment.utc().add(3,'hours').format();
	var time_limit = moment(end_time,"YYYY-MM-DDTHH:mm:ssZ").add(30,'minutes').format();
	//    "start_time":{"$gte":start_time,"$lt":end_time}
	  matchShareModel.get({"start_time":{"$gte":start_time,"$lt":end_time}},function(matchErr,matchResults){
		if(matchErr){
			console.log("Error while getting share results");
		  //	console.log(matchErr);
		}else if((matchResults)&&(matchResults.length)){
			async.eachSeries(matchResults,function(eachResult,callbackToMatch){
				findMatches(eachResult,function(matchErr,result){
					callbackToMatch(matchErr);
				});
			},function(matchErr){
				if(matchErr){
					console.log(matchErr);
					console.log("Error while sending the email.");
				} else{
					console.log("Successfully sended Email");
				}
			 //	console.log("Successfully sended Email");
			});
		  //	findMatches()
		}else{
			console.log("no results found");
		}
	});
}

function findMatches(matchObj,callbackToEmailMatch){
 var start_time = moment(matchObj.start_time).subtract(15,'minutes').format();
 var end_time = moment(matchObj.start_time).add(15,'minutes').format();
 var distance = 4;
 	async.parallel({
 		startLocMatches:function(startLocCallback){
        	matchShareModel.get({"startLocation" : { $nearSphere : {$geometry: matchObj.startLocation, $maxDistance: (distance * 1000) }},"start_time":{"$gte":start_time,"$lt":end_time}},startLocCallback);
 		},
 		endLocMatches:function(endLocCallback){
 		   matchShareModel.get({"endLocation" : { $nearSphere : {$geometry: matchObj.endLocation, $maxDistance: (distance * 1000) }},"start_time":{"$gte":start_time,"$lt":end_time}},endLocCallback);
 		}
 	},function(asyErr,matchedResults){
 		console.log(matchedResults);
 		if(asyErr){
 			callbackToEmailMatch(asyErr,null);
 		}else if((matchedResults)&&(matchedResults.startLocMatches)&&(matchedResults.endLocMatches)){
 			var fromArr = underscore.pluck(matchedResults.startLocMatches,'_id');
 			var toArr = underscore.pluck(matchedResults.endLocMatches,'_id');
 			var finalArr = underscore.intersection(fromArr,toArr);
 			if((finalArr)&&(finalArr.length)){
 				async.eachSeries(finalArr,function(eachMatchId,matchCallback){
 					var shareObj = underscore.find(matchedResults.startLocMatches,function(obj) { return obj._id == eachMatchId});
 					if(((matchObj.car == 1)&&(shareObj.car == 0))||((matchObj.car == 0)&&(shareObj.car == 1))){

 					emailUserModel.getOne({"$or":[{"share_id":shareObj._id},{"share_id":matchObj._id}],"$or":[{"match_id":matchObj._id},{"match_id":eachMatchId}]},function(mailSendErr,mailSendResult){
 						if(mailSendErr){
 							matchCallback(mailSendErr);
 						}else if(mailSendResult){
 							matchCallback();
 						}else{

 							//   send email to both the users.

 							sendEmailToBothUsers(matchObj,shareObj,function(errEmail,mailResult){
 								if(errEmail){
 									matchCallback(errEmail);
 								}else{
 									matchCallback();
 								}
 							});
 						}
 					});
 					}else{
 						emailWithNoResult(matchObj,callbackToEmailMatch);
 						// send email with no results
 					}
 				},function(errMatch){
 					callbackToEmailMatch(errMatch,null);
 				});
 			}else{
 				emailWithNoResult(matchObj,callbackToEmailMatch);
 				// send email with no results
 			}
 		}else{
 			emailWithNoResult(matchObj,callbackToEmailMatch);
 			// send email with no results found
 		}
 	});
}

function sendEmailToBothUsers(matchObj,shareObj,mailCallback){
	async.parallel({
		fromLoc:function(userSenderCallback){
			 userModel.getOne({"_id":matchObj.user_id},userSenderCallback);
		},
		toLoc:function(recUserCallback){
			 userModel.getOne({"_id":shareObj.user_id},recUserCallback);
		}
	},function(userErr,userResult){
			if(userErr){
				mailCallback(userErr,null);
			}else if((userResult)&&(userResult.fromLoc)&&(userResult.toLoc)){
					var emailValues={};
					var passengeremailValues = {};
					if(matchObj.car ==1){
						emailValues.username = userResult.fromLoc.username; // userResult.username;
     //	emilValues.email = data.email;
     emailValues.from = shareObj.start_address;//tripDetails.start_address;
     emailValues.to = shareObj.end_address; //tripDetails.end_address;
     emailValues.start_time = shareObj.start_time; // tripDetails.start_time;
     emailValues.shareuser = userResult.toLoc.username;
     	passengeremailValues.username =  userResult.toLoc.username;//userResult.fromLoc.username; // userResult.username;
     //	emilValues.email = data.email;
     passengeremailValues.from = matchObj.start_address;// shareObj.start_address;//tripDetails.start_address;
     passengeremailValues.to = matchObj.end_address; // shareObj.end_address; //tripDetails.end_address;
     passengeremailValues.start_time = matchObj.start_time; // tripDetails.start_time;
     passengeremailValues.shareuser = userResult.fromLoc.username;
					}else{
						emailValues.username =  userResult.toLoc.username;//userResult.fromLoc.username; // userResult.username;
     //	emilValues.email = data.email;
     emailValues.shareuser = userResult.fromLoc.username;
     emailValues.from = matchObj.start_address;// shareObj.start_address;//tripDetails.start_address;
     emailValues.to = matchObj.end_address; // shareObj.end_address; //tripDetails.end_address;
     emailValues.start_time = matchObj.start_time; // tripDetails.start_time;
     passengeremailValues.username = userResult.fromLoc.username; // userResult.username;
     //	emilValues.email = data.email;
     passengeremailValues.from = shareObj.start_address;//tripDetails.start_address;
     passengeremailValues.to = shareObj.end_address; //tripDetails.end_address;
     passengeremailValues.start_time = shareObj.start_time; // tripDetails.start_time;
     passengeremailValues.shareuser = userResult.toLoc.username;
					}
     	
   //  emailValues.url = url;
     //	console.log(emilValues);
     	app.render("share-passenger",emailValues,function(error,html){
     		if(error){
     			console.log(error,html);
     			mailCallback(error,null);
     		  //	emailCallback(error,null);
     		}else{
     			var emailDetails = {};
     			if(matchObj.car == 1){
     				emailDetails.email = userResult.fromLoc.email;
     				var shareUser = userResult.toLoc.username;
     			}else{
     				emailDetails.email = userResult.toLoc.email;
     				var shareUser = userResult.fromLoc.username;
     			}
     		emailDetails.html = html;//"conform mail by click <a href="+emilValues.conformationlink+">here</a>";//html;
     		emailDetails.subject = shareUser+" to share Your taxi";
     		  email(emailDetails,function(emailErr,emailResult){
     		  	if(emailErr){
     		  		mailCallback(emailErr);
     		  	}else{
     		  		app.render("share-car",passengeremailValues,function(error,html){
     		  			if(error){
     		  				mailCallback(error,null);
     		  			}else{
     		  				var passengerDetails = {};
     		  				if(shareObj.car == 1){
     		  					passengerDetails.email = userResult.toLoc.email;
     				var shareUser = userResult.fromLoc.username;
     		  				}else{
     		  				  passengerDetails.email = userResult.fromLoc.email;
     				var shareUser = userResult.toLoc.username;
     		  				}
     		  				passengerDetails.html = html;
     		  				passengerDetails.subject = shareUser+" is ready to share taxi";
     		  				email(passengerDetails,function(emailErr,shareEmailResult){
     		  					if(emailErr){
     		  						mailCallback(emailErr,null);
     		  					}else{
     		  						var emailObj = {};
     		  						emailObj._id = uuid.v4();
     		  						emailObj.match_id = matchObj._id;
     		  						emailObj.share_id = shareObj._id;
     		  						emailUserModel.insert(emailObj,mailCallback);
     		  					}
     		  				});
     		  			}
     		  		});
     		  	}
     		  });
      //		  email(emailDetails,mailCallback);
	 						}
	 					});
			}else{
				mailCallback(null,null);
			}
	});
}

function emailWithNoResult(matchObj,callback){
	var start_time = moment().utc().add(3,'hours').format();
	var end_time = moment(start_time,"YYYY-MM-DDTHH:mm:ssZ").utc().add(30,'minutes').format();
	if((matchObj.start_time > start_time)&&(matchObj.start_time < end_time)){
		 userModel.getOne({"_id":matchObj.user_id},function(userErr,userObj){
		if(userErr){
			callback(userErr,null);
		}else if(userObj){
			var emailValues = {};
			emailValues.username = userObj.username;
			emailValues.from = userObj.start_address;
			emailValues.to = userObj.end_address;
		app.render("matches-empty",emailValues,function(error,html){
			var emailDetails = {};
			emailDetails.html = html;
			emailDetails.subject = "No matching Results Found.";
			email(emailDetails,callback);
		});
		}else{
			callback(null,null);
		}
	});
	}else{
		callback(null,null);
	}
}

	return {
		sendEmailForMatching:sendEmailForMatching
	}
}
module.exports = cronjobs;