app.controller('mapController',function ($scope, $rootScope, $routeParams, $location, $http,$cookieStore,$interval,Data) {
var placeSearch, autocomplete,fromAutocomplete;
$scope.map;
$scope.position = $scope.position||{};
$scope.search_position = {};
$scope.occupied = false;
$scope.fromAddress;
$scope.toAddress;
$scope.fulladdress;
$scope.interval;
$scope.marker;
$scope.toMarker;
$scope.fromMarker;
$scope.markers = [];
$scope.fromLocation = {};
$scope.toLocation = {};
var directionsDisplay;  // new google.maps.DirectionsRenderer();
var directionsService;  // new google.maps.DirectionsService();

console.log(parseFloat(geoplugin_latitude()));
$scope.initAutocomplete = function () {
	console.log("this function called");
   $scope.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });
      directionsDisplay = new google.maps.DirectionsRenderer;
   directionsService = new google.maps.DirectionsService;
   directionsDisplay.setMap($scope.map);
  //map.setCenter({lat: -34.397, lng: 150.644});
  fromAutocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('fromAddress'))
      );
 fromAutocomplete.addListener('place_changed', pointPlace); 
  autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete'))
      );
 autocomplete.addListener('place_changed', toPointPlace);
  $scope.geolocate(true);
}
var toPointPlace = function(){
var place = autocomplete.getPlace();
$scope.search_position.dest_lat = place.geometry.location.lat();
$scope.search_position.dest_lng = place.geometry.location.lng();
$scope.toAddress = place.formatted_address;
var pos = {};
pos.lat = $scope.search_position.dest_lat;
pos.lng = $scope.search_position.dest_lng;
// $scope.fulladdress = place.formatted_address;
$scope.setLocation($scope.search_position.dest_lat,$scope.search_position.dest_lng,$scope.toAddress,false);
// $scope.toMarker = setMarker(pos,"Your searched place");
}

var pointPlace = function() {
  var place = fromAutocomplete.getPlace();
  console.log(place);
  var pos = {};
  pos.lat = place.geometry.location.lat();
  pos.lng = place.geometry.location.lng();
  $scope.position.present_lat = pos.lat;
  $scope.position.present_lng = pos.lng;
 //  $scope.search_position.dest_lat = pos.lat;
 // $scope.search_position.dest_lng = pos.lng;
  $scope.fulladdress = place.formatted_address;
  $scope.fromAddress =   $scope.fulladdress;// $scope.fullname;
  console.log(pos);
  console.log($scope.fulladdress);
  $scope.setLocation(pos.lat,pos.lng,$scope.fulladdress,true);
 // $scope.fromMarker(null);
  $scope.fromMarker.setMap(null);
  $scope.fromMarker = setMarker(pos,"Your location");
/* 
 var data1 = {};
 // data.fulladdress = $scope.fulladdress;
  data1.fulladdress = $scope.fulladdress;
*/ /* 
      { 
        type : "Point" ,
        coordinates : [ <longitude> , <latitude> ] 
        }
                                */
/*
  data1.location = {
      type : "Point" ,
      coordinates : [ $scope.search_position.dest_lng , $scope.search_position.dest_lat ] 
  };
  data1.user_id = $rootScope.userinfo._id;
  */

  //  $scope.updateLocation(data1);

  //   $scope.map.setCenter(pos);

   /*
   var marker = new google.maps.Marker({
    position: pos,
    map: $scope.map,//map,//$scope.map,
    title: "you are searched place"
  });
 marker.setMap($scope.map);
 $scope.map.setCenter(pos);
 */
 }

 $scope.getAddress = function(lat,lng,from,driver){
  driver = driver || false;
  var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng;

  // "&key=AIzaSyCaNv-gUgTdhwy3nSYSUq1pjJHAKoiPkWk";

  Data.getService(url).then(function(results){
    console.log("I am from google maps api results");
    console.log(results);
    console.log(results.results[0]);
    console.log(results.results[0]["formatted_address"]);
    console.log("---------------------------------");
    if((results)&&(results.status == "OK")&&(results.results[0])&&(results.results[0].formatted_address)){
      console.log("I am from ok block");
      console.log("from addr:"+results.results[0].formatted_address);
     $scope.fulladdress  = results.results[0].formatted_address;   
      console.log("I am from driver values");
      console.log(driver);
      if(!driver){
      
    //  $scope.setLocation(lat,lng,$scope.fromAddress,from);
      } 
      $scope.setLocation(lat,lng,$scope.fulladdress,from);
      /*if(location._id){
         console.log("Location setting successfully");     
   }else{
    console.log("Location setting Failed.");
      }*/
      //return $scope.fromAddress;
    }else{
      $scope.fulladdress = "";
      alert("failed to get location name");
  //   return "";
    }
  });
 }

$scope.setLocation = function(lat,lng,address,from){
  console.log("address:-------"+address);
  var location = {};
  location.full_address = address;
  location.location = {type : "Point" ,coordinates :[lng,lat]};
 if(from){
          $scope.location = location.location;
          $scope.fromLocation = $scope.location;
          $scope.fromAddress = address;
     console.log("I am from from");
     
     if(!($rootScope.login_status)) {
      $scope.location = location.location;
       $cookieStore.put('login',{"status":true,"location":location});
       var location_address = address;
        $scope.setLoginAudit($rootScope.userinfo._id,location.location,location_address);
     }else{
      $cookieStore.put('login',{"status":true,"location":location});
   } 
} else{
    $scope.toAddress = address;
    $scope.toLocation = location.location; // results.location;
    console.log("I am from to");
  }

  if($rootScope.userinfo.usertype == "D"){
            var taxiLocationObj = {};
            taxiLocationObj.full_address = address;
            taxiLocationObj.driver_id = $rootScope.userinfo._id;
            taxiLocationObj.location = {type : "Point" ,coordinates :[lng,lat]};
            taxiLocationObj.isOccupied = $scope.occupied;
            Data.post("/drivers/taxilocation",taxiLocationObj).then(function(results){
              if(results.status == "success"){
                if((results.taxiinfo)&&(results.taxiinfo.isOccupied)){
                   $interval.cancel($scope.interval);
                }
                console.log("Success fully updated location");
              }else{
                console.log("Failed to update location:"+results.msg);
              }
            });
}
          
   //      /passengers/setlocation
 /*
  Data.post("/passengers/setlocation",location).then(function(results){
    console.log(results);
        if(results.status == "success"){
          }
          }else{
           console.log("I am from else block.");
          }
      });
*/
}

var setMarker = function(pos,title){
 // var marker;
 $scope.marker = new google.maps.Marker({
    position: pos,
    map: $scope.map,//map,
    title: title
  });
 // marker.setMap($scope.map);
 $scope.marker.setMap($scope.map);
 $scope.map.setCenter(pos);
 // google.maps.Animation.DROP
 // google.maps.Animation.BOUNCE
 $scope.marker.setAnimation(google.maps.Animation.BOUNCE);
 return $scope.marker;
 
}

$scope.updateLocation = function(location){
	
	//    /savesearch

 Data.post('/passengers/savesearch',location).then(function(results){
 	console.log(results);
 	if(results.status == "success"){
 		console.log("I am from success block");
 	}else if(results.status == "success2"){
 		console.log("I am from success2 block");
 	}else{
 		console.log("I am from else block");
 	}
 });
}

$scope.geolocate = function(isFrom) {
	console.log("geolocate function");
	 $scope.geolocation = {}
  if (navigator.geolocation) {
  	//      timeout: 10 * 1000 // 10 seconds
  	 var positionOptions = {
            enableHighAccuracy: true
          };
    navigator.geolocation.getCurrentPosition(function(position) {
    	console.log(position);
      $scope.geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
     
   //  $scope.position.present_lat = $scope.geolocation.lat;
   //   $scope.position.present_lng = $scope.geolocation.lng;
     console.log($scope.geolocation);
     if(!$scope.marker){
    $scope.fromMarker = setMarker($scope.geolocation,"your default location");
     }

     // setMarker($scope.geolocation,"your's place.");
     //   $scope.map.setCenter($scope.geolocation);

    /*
     $cookieStore.put('login',{"status":true,"location":location});
     $scope.location_id = location._id;
     $rootScope.login_status = true;
     */

        $scope.setAutocomplete($scope.geolocation,position.coords.accuracy,isFrom);
    },function(error){
    	/*
    	$location.path("login");
    	alert("please enable $scope.geolocation");
    	*/
    	$scope.geolocation.lat = parseFloat(this.geoplugin_latitude());
    	$scope.geolocation.lng = parseFloat(this.geoplugin_longitude());

    //	$scope.position.present_lat = $scope.geolocation.lat;
    //  $scope.position.present_lng = $scope.geolocation.lng;
     console.log($scope.geolocation);
     if(!$scope.marker){
      $scope.fromMarker =	setMarker($scope.geolocation,"your default location");
     }

     // setMarker($scope.geolocation,"your's place.");
     //   $scope.map.setCenter($scope.geolocation);
      $scope.setAutocomplete($scope.geolocation,1000,isFrom);
    },positionOptions);
     
  }else{
    console.log("coming here to else block");
    $scope.geolocation.lat = parseFloat(this.geoplugin_latitude());
    $scope.geolocation.lng = parseFloat(this.geoplugin_longitude());

   // $scope.position.present_lat = $scope.geolocation.lat;
   //   $scope.position.present_lng = $scope.geolocation.lng;
     console.log($scope.geolocation);
     if(!$scope.marker){
      $scope.fromMarker =	setMarker($scope.geolocation,"your default location");
     }

     $scope.setAutocomplete($scope.geolocation,1000,isFrom);
  }
  
}

$scope.setAutocomplete = function(geolocation,radius,from){
 //  console.log($scope.getAddress(geolocation.lat,geolocation.lng));
     var address = $scope.getAddress(geolocation.lat,geolocation.lng,from);
     console.log("I am from address:"+address);
   //  var location = $scope.setLocation(geolocation.lat,geolocation.lng,$scope.getAddress(geolocation.lat,geolocation.lng));
   //  console.log(location);
     

    var circle = new google.maps.Circle({
        center: geolocation, // $scope.geolocation,
        radius: radius
      });
      autocomplete.setBounds(circle.getBounds());
      fromAutocomplete.setBounds(circle.getBounds());

}

$scope.setLoginAudit = function(user_id,location,address){
  var loginAudit = {};
  loginAudit.user_id = user_id;
  loginAudit.location = location;
  loginAudit.full_address = address;
  //loginAudit.logged_location_id = location_id;
  Data.post("/save/loginaudit",loginAudit).then(function(results){
    if(results.status == "success"){
    // $scope.location_id = location_id;
     $rootScope.login_status = true;
      console.log("Successfully updated login details");
    }else{
      console.log(results.msg);
    }
  }); 
}

$scope.driverGeolocate = function() {
	  $scope.geolocation = {};
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
     $scope.geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
     console.log($scope.geolocation);
     $scope.position.loc_lat = $scope.geolocation.lat;
     $scope.position.loc_lng = $scope.geolocation.lng;
      $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true,true); 
     if(confirm("Do you want passengers?")){
     	$scope.occupied = false;
     	$scope.trackLocation();
   //   $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true); 
   //  	$scope.setChangeLocation($scope.position);
     }else{
     	$scope.occupied = true;
     	$scope.trackLocation();
   //   $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true); 
   //  	$scope.setChangeLocation($scope.position);
     }
    },function(error){
     //	$location.path("login");
     //	alert("please enable $scope.geolocation");
     $scope.geolocation.lat = parseFloat(this.geoplugin_latitude());
     $scope.geolocation.lng = parseFloat(this.geoplugin_longitude());
     console.log($scope.geolocation);
     $scope.position.loc_lat = $scope.geolocation.lat;
     $scope.position.loc_lng = $scope.geolocation.lng;
     $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true,true); 
     if(confirm("Do you want passengers?")){
     	$scope.occupied = false;
     	$scope.trackLocation();
   //  	$scope.setChangeLocation($scope.position);
     }else{
     	$scope.occupied = true;
     	$scope.trackLocation();
   //  	$scope.setChangeLocation($scope.position);
     }
    });
  }else{
  	 /*
  	 $location.path("login");
  	alert("Unable to get $scope.geolocation");
    console.log("coming here to else block");
    */
    $scope.geolocation.lat = parseFloat(geoplugin_latitude());
    $scope.geolocation.lng = parseFloat(geoplugin_longitude());
    console.log($scope.geolocation);
     $scope.position.loc_lat = $scope.geolocation.lat;
     $scope.position.loc_lng = $scope.geolocation.lng;
     $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true,true); 
     if(confirm("Do you want passengers?")){
     	$scope.occupied = false;
     	$scope.trackLocation();
  //   	$scope.setChangeLocation($scope.position);
     }else{
     	$scope.occupied = true;
     	$scope.trackLocation();
   // 	$scope.setChangeLocation($scope.position);
     }
  }
  
}

$scope.trackLocation = function(){
	 //  $timers.setInterval(callback, repeat);
	$scope.interval = $interval(function(){
	 	  $scope.geolocation = {};
	 	if (navigator.geolocation) {
	 		navigator.geolocation.getCurrentPosition(function(position) {
	 			$scope.geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      $scope.position.loc_lat = $scope.geolocation.lat;
        $scope.position.loc_lng = $scope.geolocation.lng;
      $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true); 
     /* 
     if(($scope.position.loc_lat != $scope.geolocation.lat)||($scope.position.loc_lng != $scope.geolocation.lng)){
      	$scope.position.loc_lat = $scope.geolocation.lat;
      	$scope.position.loc_lng = $scope.geolocation.lng;
      	$scope.setChangeLocation($scope.position);
      }
      */
	 		},function(error){
	 			// console.log("user disabled the location");
	 		$scope.geolocation.lat = parseFloat(this.geoplugin_latitude());
    	$scope.geolocation.lng = parseFloat(this.geoplugin_longitude());
      $scope.position.loc_lat = $scope.geolocation.lat;
      $scope.position.loc_lng = $scope.geolocation.lng;
      $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true); 
	 		/*
      if(($scope.position.loc_lat != $scope.geolocation.lat)||($scope.position.loc_lng != $scope.geolocation.lng)){
      	$scope.position.loc_lat = $scope.geolocation.lat;
      	$scope.position.loc_lng = $scope.geolocation.lng;
      	$scope.setChangeLocation($scope.position);
      }
      */
	 		});
	 	}else{
	 		console.log("I am from else block of driver location track");
	 		$scope.geolocation.lat = parseFloat(geoplugin_latitude());
    $scope.geolocation.lng = parseFloat(geoplugin_longitude());
    $scope.position.loc_lat = $scope.geolocation.lat;
        $scope.position.loc_lng = $scope.geolocation.lng;
      $scope.getAddress($scope.geolocation.lat,$scope.geolocation.lng,true); 
    /*
    if(($scope.position.loc_lat != $scope.geolocation.lat)||($scope.position.loc_lng != $scope.geolocation.lng)){
      	$scope.position.loc_lat = $scope.geolocation.lat;
      	$scope.position.loc_lng = $scope.geolocation.lng;
      	$scope.setChangeLocation($scope.position);
      }
      */
	 	}
	 	
	 },(5000*60));
}

$scope.setChangeLocation = function(data){
      var customer = {};
      customer = $scope.position;
      customer.user_id = $rootScope.userinfo._id;
      customer.occupied = $scope.occupied;
      //      /drivers/setdefault/status
      Data.post('/drivers/setdefault/status',customer
        ).then(function(results){
        	console.log(results);
            if(results.status == "success"){
                console.log(results);
            }else{
            	console.log(results.msg);
            }
        });
}

$scope.saveUserSearch = function(data){
	var customers = {};
	customers.user_id = $rootScope.userinfo._id;
	customers.present_lat = $scope.position.present_lat || $scope.geolocation.lat;
	customers.present_lng = $scope.position.present_lng || $scope.geolocation.lng;
	customers.dest_lat = $scope.search_position.dest_lat;
	customers.dest_lng = $scope.search_position.dest_lng;
  	customers.time = data.time;
	console.log(customers);
  var passengerSearch = {};
  passengerSearch.coordinates = [$scope.position.present_lng,$scope.position.present_lat];
      var pos = {};
      pos.lat = customers.present_lat;
      pos.lng = customers.present_lng;
      var destination = {};
      destination.lat = customers.dest_lat;
      destination.lng = customers.dest_lng;
      
	/*
  Data.post('/passengers/search/destination',customers).then(function(results){
		console.log(results);
		if(results.status == "success"){
			console.log(results);
		
		}else{
			console.log(results.msg);
		}
	});
*/
var routeObj = {};
routeObj.fromLocation = {
  "type":"Point",
  "coordinates":[customers.present_lng,customers.present_lat]
};
routeObj.toLocation = {
  "type":"Point",
  "coordinates":[customers.dest_lng,customers.dest_lat]
}
routeObj.startLocationAddress = $scope.fromAddress;
routeObj.endLocationAddress = $scope.toAddress;

/*
Data.post('/passengers/saveroute',routeObj).then(function(results){
if(results.status == "success"){
  console.log("I am from success");
  console.log(results);
}else{
  console.log("I am from fail block");
  console.log(results);
}
});
*/

Data.post('/passengers/avilabletaxies',passengerSearch).then(function(results){
// /passengers/avilabletaxies
if(results.status == "success"){
  console.log(results);

 // $scope.toMarker = setMarker(pos,'Your searched location.');
  for(var i = 0;i < results.taxies.length ;i++){
    var coordinates = results.taxies[i].location.coordinates;
    var driverPosition = {};
    driverPosition.lat = coordinates[1];
    driverPosition.lng = coordinates[0];
    var driverMarker = setMarker(driverPosition,'Driver location');
  }
}else{
  console.log("I am from elase bloack failed to get the results");
}

});

var start = new google.maps.LatLng(pos.lat,pos.lng);
 var end = new google.maps.LatLng(destination.lat,destination.lng);
 console.log("from:"+$scope.fromAddress);
 console.log("to:"+$scope.toAddress);
 $scope.fromMarker.setMap(null);
 //$scope.fromMarker.setMap(null);
directionsService.route({
       origin: $scope.fromAddress, //start,//data.from,//
       destination: $scope.toAddress, // end,// data.destination,  
       travelMode: google.maps.TravelMode.DRIVING
         }, function(resultdata, status) {
          console.log(resultdata);
          var routeObj = {};
routeObj.fromLocation = {
  "type":"Point",
  "coordinates":[customers.present_lng,customers.present_lat]
};
routeObj.toLocation = {
  "type":"Point",
  "coordinates":[customers.dest_lng,customers.dest_lat]
}
routeObj.startLocationAddress = $scope.fromAddress;
routeObj.endLocationAddress = $scope.toAddress;
          var tripDetails = {};
          tripDetails.startLocation = {};
          tripDetails.startLocation.location = {"type":"Point","coordinates":[pos.lng,pos.lat]};
          tripDetails.startLocation.full_address = $scope.fromAddress;
          tripDetails.endLocation = {};
          tripDetails.endLocation.location = {"type":"Point","coordinates":[destination.lng,destination.lat]};
          tripDetails.endLocation.full_address = $scope.toAddress;
          tripDetails.timeToLeave = "2015-09-18T10:15:18+00:00";
          tripDetails.user_id = $rootScope.userinfo._id;

          // /searched/trip

           if (status == google.maps.DirectionsStatus.OK) {
            tripDetails.directionsResult = resultdata.routes;
            Data.post('/passengers/searched/trip',tripDetails).then(function(results){
              if(results.status == "success"){
                console.log(results);
                directionsDisplay.setDirections(resultdata);
              }else{
                console.log(results);
                alert(results.msg);
              }
            }); 
           /*
            Data.post('/passengers/savetrip',tripDetails).then(function(results){
              if(results.status == "success"){
                console.log(results);
              }else{
                console.log(results);
              }
            });
              */
            //   waypoints:[{location: "borabanda,Hyderabad,Telangana",stopover: true }],

         /*
            var subroutes = [];
            var subObj = {};
            var k = 0;
            for(var i in resultdata.routes[0].legs){
              console.log(resultdata.routes[0].legs[i]);
              subObj.start_locality = resultdata.routes[0].legs[i].start_address;
              subObj.start_location = resultdata.routes[0].legs[i].start_location;
              subObj.end_locality = resultdata.routes[0].legs[i].end_address;
              subObj.end_location = resultdata.routes[0].legs[i].end_location;
              subObj.encriptedline = [];
              for(var j in resultdata.routes[0].legs[i].steps){
                subObj.encriptedline.push(resultdata.routes[0].legs[i].steps[j].polyline.points);
              }
              subroutes.push(subObj);
            }
            console.log(subroutes);
            */
           }else{
            alert("Failed to get google maps direction");
           }
         });  
}

$scope.findMatchData = function(matchdata){
        var matchObj = {};
        var start_lat = $scope.position.present_lat || $scope.geolocation.lat;
        var start_lng = $scope.position.present_lng || $scope.geolocation.lng;
        var end_lat = $scope.search_position.dest_lat;
        var end_lng = $scope.search_position.dest_lng;
        matchObj.startLocation = {
          "type":"Point",
          "coordinates":[parseFloat(start_lng),parseFloat(start_lat)]
        };
        matchObj.endLocation = {
          "type":"Point",
          "coordinates":[parseFloat(end_lng),parseFloat(end_lat)]
        };
        matchObj.timeToLeave = "2015-09-18T10:15:18+00:00";
        matchObj.user_id = $rootScope.userinfo._id;
        /*
        matchObj.startPosition = {
          "type":"Point",
          "coordinates":[parseFloat(start_lng),parseFloat(start_lat)]
        };
        matchObj.endPosition = {
          "type":"Point",
          "coordinates":[parseFloat(end_lng),parseFloat(end_lat)]
        };
        */

        Data.post('/passengers/match/trips',matchObj).then(function(results){
          if(results.status){   //   == "success"
            console.log(results);
          var trips = [];
          trips = [{"start_address":$scope.fromAddress,"end_address":$scope.toAddress}];//results.matches;
          $scope.trips = trips;
          $scope.fromMarker.setMap(null);
          var markers = [];
          var infowindow = [];
            for (var j = 0; j < $scope.markers.length; j++) {
      $scope.markers[j].setMap(null);
    }
          for(var i =0;i<trips.length;i++){

            directionsService.route({
       origin: trips[i].start_address,//routes[i].start_location_info.full_address, //start,//data.from,//
       destination: trips[i].end_address,//routes[i].end_location_info.full_address, // end,// data.destination,
       travelMode: google.maps.TravelMode.DRIVING
         }, function(resultdata, status) {
          console.log(resultdata);
           if (status == google.maps.DirectionsStatus.OK) {
            var rendererOptions = {
                  preserveViewport: false,//true,         
                  suppressMarkers: true,//false,//true,
                  routeIndex:i
                  };

                  var leg = resultdata.routes[ 0 ].legs[ 0 ];
                  var pos = leg.start_location;
                  var pos1 = leg.end_location;
                        markers.push(new google.maps.Marker({
      position: pos, 
      map: $scope.map,
      icon: "http://maps.google.com/mapfiles/marker" + String.fromCharCode(markers.length + 65) + ".png"
    })); 
                    markers.push(new google.maps.Marker({
      position: pos1, 
      map: $scope.map,
      icon: "http://maps.google.com/mapfiles/marker" + String.fromCharCode(markers.length + 65) + ".png"
    })); 
             matchDirectionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
             var image = 'http://localhost:3000/images/45b3028e-845b-43fa-9f12-21d47dc80649.jpg'; //trips[i].start_address //trips[i].end_address
               infowindow[i] = new google.maps.InfoWindow({
    content: '<div><img src="'+image+'">From:'+'Hyderabad'+'<br/>To:'+'begumpeta'+'<button id="'+$rootScope.userinfo._id+'" ng-click="shareMessageSend({user_id:'+$rootScope.userinfo._id+'})">Share</button></div>'
  });                
               markers[i].addListener('click', function() {
    infowindow[i].open($scope.map, markers[i]);
  });
             matchDirectionsDisplay.setMap($scope.map);
             matchDirectionsDisplay.setDirections(resultdata);
           }else{
            alert("Failed to get google maps direction");
           }
         });  
          }
          $scope.markers = markers;
          }else{
            console.log("failed to get routes");
            console.log(results);
          }
        });
}

$scope.shareMessageSend = function(data){
  console.log("share message");
  console.log(data);
}
});