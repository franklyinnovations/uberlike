app.controller('mapController',function ($scope, $rootScope, $routeParams, $location, $http,$cookieStore,$interval,Data) {
var placeSearch, autocomplete;
$scope.map;
$scope.position = $scope.position||{};
$scope.search_position = {};
$scope.occupied = 0;
$scope.marker;
$scope.initAutocomplete = function () {
	console.log("this function called");
   $scope.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 12,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });
  //map.setCenter({lat: -34.397, lng: 150.644});
    $scope.geolocate();
  autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete'))
      );
 autocomplete.addListener('place_changed', pointPlace);
}
var pointPlace = function() {
  var place = autocomplete.getPlace();
  console.log(place);
  var pos = {};
  pos.lat = place.geometry.location.lat();
  pos.lng = place.geometry.location.lng();
  $scope.search_position.dest_lat = pos.lat;
  $scope.search_position.dest_lng = pos.lng;
  console.log(pos);
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
$scope.setMarker = function(pos,title){
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
}
$scope.geolocate = function() {
	console.log("geolocate function");
  if (navigator.geolocation) {
  	//      timeout: 10 * 1000 // 10 seconds
  	 var positionOptions = {
            enableHighAccuracy: true
          };
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      $scope.position.present_lat = geolocation.lat;
      $scope.position.present_lng = geolocation.lng;
     console.log(geolocation);
     if(!$scope.marker){
     	$scope.setMarker(geolocation,"your default location");
     }

     // setMarker(geolocation,"your's place.");
     //   $scope.map.setCenter(geolocation);
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    },function(error){
    	$location.path("login");
    	alert("please enable geolocation");
    },positionOptions);
  }else{
    console.log("coming here to else block");
  }
}
$scope.driverGeolocate = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
     console.log(geolocation);
     $scope.position.loc_lat = geolocation.lat;
     $scope.position.loc_lng = geolocation.lng;
     if(confirm("Do you want passengers?")){
     	$scope.occupied = 0;
     	$scope.trackLocation();
     	$scope.setChangeLocation($scope.position);
     }else{
     	$scope.occupied = 1;
     	$scope.trackLocation();
     	$scope.setChangeLocation($scope.position);
     }
    },function(error){
    	$location.path("login");
    	alert("please enable geolocation");
    });
  }else{
  	 $location.path("login");
  	alert("Unable to get geolocation");
    console.log("coming here to else block");
   
  }
}
$scope.trackLocation = function(){
	 //  $timers.setInterval(callback, repeat);
	 $interval(function(){
	 	if (navigator.geolocation) {
	 		navigator.geolocation.getCurrentPosition(function(position) {
	 			var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      if(($scope.position.loc_lat != geolocation.lat)||($scope.position.loc_lng != geolocation.lng)){
      	$scope.position.loc_lat = geolocation.lat;
      	$scope.position.loc_lng = geolocation.lng;
      	$scope.setChangeLocation($scope.position);
      }
	 		},function(error){
	 			console.log("user disabled the location");
	 		});
	 	}else{
	 		console.log("I am from else block of driver location track");
	 	}
	 },1000);
}
$scope.setChangeLocation = function(data){
      var customer = {};
      customer = $scope.position;
      customer.user_id = $rootScope.userinfo._id;
      customer.occupied = $scope.occupied;
      //      /drivers/setdefault/status
      Data.post('/drivers/setdefault/status',customer
        ).then(function(results){
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
	Data.post('/passengers/search/destination',customers).then(function(results){
		if(results.status == "success"){
			console.log(results);
			var pos = {};
			pos.lat = customers.dest_lat;
			pos.lng = customers.dest_lng;
  $scope.setMarker(pos,'Your searched location.');
		}else{
			console.log(results.msg);
		}
	});
}
});