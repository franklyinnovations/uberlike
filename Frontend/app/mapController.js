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
  $scope.search_position.dest_lat = pos.lat;
  $scope.search_position.dest_lng = pos.lng;
  $scope.fulladdress = place.formatted_address;
  $scope.fromAddress = $scope.fullname;
  console.log(pos);
  console.log($scope.fulladdress);
  $scope.setLocation($scope.search_position.dest_lat,$scope.search_position.dest_lng,$scope.toAddress,false);
 // $scope.fromMarker(null);
 $scope.fromMarker.setMap(null);
  $scope.fromMarker = setMarker(pos,"Your location");
  var data1 = {};
 // data.fulladdress = $scope.fulladdress;
  data1.fulladdress = $scope.fulladdress;
 /* 
      { 
        type : "Point" ,
        coordinates : [ <longitude> , <latitude> ] 
        }
                                */
  data1.location = {
      type : "Point" ,
      coordinates : [ $scope.search_position.dest_lng , $scope.search_position.dest_lat ] 
  };
  data1.user_id = $rootScope.userinfo._id;

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
      $scope.fromAddress = results.results[0].formatted_address;   
      console.log("I am from driver values");
      console.log(driver);
      if(!driver){
      
    //  $scope.setLocation(lat,lng,$scope.fromAddress,from);
      } 
      $scope.setLocation(lat,lng,$scope.fromAddress,from);
      /*if(location._id){
         console.log("Location setting successfully");     
   }else{
    console.log("Location setting Failed.");
      }*/
      //return $scope.fromAddress;
    }else{
      $scope.fromAddress = "";
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
   //      /passengers/setlocation
  Data.post("/passengers/setlocation",location).then(function(results){
    console.log(results);
        if(results.status == "success"){
          if($rootScope.userinfo.usertype == "D"){
            var taxiLocationObj = {};
            taxiLocationObj.driver_id = $rootScope.userinfo._id;
            taxiLocationObj.location_id = results.location._id;
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
          
       //   return $scope.location;
         if(from){
          $scope.location = results.location;
          $scope.fromLocation = $scope.location;
     console.log("I am from from");
     if(!($rootScope.login_status)) {
      $scope.location = results.location;
       $cookieStore.put('login',{"status":true,"location":location});
        $scope.setLoginAudit($rootScope.userinfo._id,results.location._id);
     }else{
      $cookieStore.put('login',{"status":true,"location":results.location});
     }

  }else{
    $scope.toLocation = results.location;
    console.log("I am from to");
  }
          }else{
           //  return {};
           console.log("I am from else block.");
          }
      });
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
     
     $scope.position.present_lat = $scope.geolocation.lat;
      $scope.position.present_lng = $scope.geolocation.lng;
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

    	$scope.position.present_lat = $scope.geolocation.lat;
      $scope.position.present_lng = $scope.geolocation.lng;
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

    $scope.position.present_lat = $scope.geolocation.lat;
      $scope.position.present_lng = $scope.geolocation.lng;
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

$scope.setLoginAudit = function(user_id,location_id){
  var loginAudit = {};
  loginAudit.user_id = user_id;
  loginAudit.location_id = location_id;
  //loginAudit.logged_location_id = location_id;
  Data.post("/save/loginaudit",loginAudit).then(function(results){
    if(results.status == "success"){
     $scope.location_id = location_id;
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
     	$scope.setChangeLocation($scope.position);
     }else{
     	$scope.occupied = true;
     	$scope.trackLocation();
     	$scope.setChangeLocation($scope.position);
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
	customers.present_lat = $scope.position.present_lat;
	customers.present_lng = $scope.position.present_lng;
	customers.dest_lat = $scope.search_position.dest_lat;
	customers.dest_lng = $scope.search_position.dest_lng;
  	customers.time = data.time;
	console.log(customers);
  var passengerSearch = {};
  passengerSearch.coordinates = [$scope.position.present_lng,$scope.position.present_lat];
      var pos = {};
      pos.lat = customers.dest_lat;
      pos.lng = customers.dest_lng;
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
Data.post('/passengers/avilabletaxies',passengerSearch).then(function(results){
// /passengers/avilabletaxies
if(results.status == "success"){
  console.log(results);

  $scope.toMarker = setMarker(pos,'Your searched location.');
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
   directionsDisplay = new google.maps.DirectionsRenderer();
   directionsService = new google.maps.DirectionsService();
directionsService.route({
       origin:start,
       destination: end,
       travelMode: google.maps.TravelMode.DRIVING
         }, function(resultdata, status) {
          console.log(resultdata);
           if (status == google.maps.DirectionsStatus.OK) {
         
            /*
            var line = new google.maps.Polyline({
    path: [new google.maps.LatLng(pos.lat,pos.lng), new google.maps.LatLng(destination.lat,destination.lng)],
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 10,
    geodesic: true,
    map: $scope.map
});
*/

             directionsDisplay.setDirections(resultdata);
         //     directionsDisplay.setMap($scope.map);
           }else{
            alert("Failed to get google maps direction");
           }

         });  

}

});