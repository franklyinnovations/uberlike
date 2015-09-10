app.controller('mapCtrl',function ($scope, $rootScope, $routeParams, $location, $http,$cookieStore,$interval,Data) {
$scope.map;
$scope.geolocation;
$scope.fulladdress;

$scope.initMap = function(){
	 $scope.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });
	 google.maps.event.addListener($scope.map, 'click',$scope.getPosition);
autoComplete = new google.maps.places.Autocomplete(
      (document.getElementById('fromAddress'))
      );
 autoComplete.addListener('place_changed', pointPlace); 
if(navigator.geolocation){
	navigator.geolocation.getCurrentPosition(function(position){
		var pos = {};
		pos.lat = position.coords.latitude;
		pos.lng = position.coords.longitude;
		$scope.map.setCenter(pos);
	});
}
}

$scope.getPosition = function(positionData){

	var pos = {};
	pos.lat = positionData.latLng.lat();
	pos.lng = positionData.latLng.lng();
	var lat = pos.lat;
	var lng = pos.lng;
	console.log("position object is.");
	console.log(pos);
	var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng;
	Data.getService(url).then(function(results){
    console.log("I am from google maps api results");
    console.log(results);
    console.log(results.results[0]);
    console.log(results.results[0]["formatted_address"]);
    console.log("---------------------------------");
    if((results)&&(results.status == "OK")&&(results.results[0])&&(results.results[0].formatted_address)){
    	$scope.fulladdress = results.results[0].formatted_address;
    	insertLocation(pos);
    }else{
    	alert("Failed to get user location");
    }
});
}

var pointPlace = function() {
  var place = autoComplete.getPlace();
  console.log(place);
  var pos = {};
  pos.lat = place.geometry.location.lat();
  pos.lng = place.geometry.location.lng();
  $scope.fulladdress = place.formatted_address;
  insertLocation(pos);
}

var insertLocation = function(position){
	var lat = position.lat;
	var lng = position.lng;
    var location = {};
  location.full_address = $scope.fulladdress;
  location.location = {type : "Point" ,coordinates :[lng,lat]};
   //      /passengers/setlocation
  Data.post("/passengers/setlocation",location).then(function(results){
  	if(results.status == "success"){
  		 var taxiLocationObj = {};
            taxiLocationObj.driver_id = "1234555010101";
            taxiLocationObj.location_id = results.location._id;
            taxiLocationObj.isOccupied = false;
            Data.post("/drivers/taxilocation",taxiLocationObj).then(function(results){
              if(results.status == "success"){
               
               // console.log("Success fully updated location");
               alert("saved taxi location");
              }else{
               alert("failed to insert taxilocation");
              }
            });
  	}else{
  		alert("Error while saving.");
  	}
  })
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

     console.log($scope.geolocation);
        $scope.setAutocomplete($scope.geolocation,position.coords.accuracy);
    }
    );
}
}
  
$scope.setAutocomplete = function(geolocation,radius,from){

    var circle = new google.maps.Circle({
        center: geolocation, // $scope.geolocation,
        radius: radius
      });
      autoComplete.setBounds(circle.getBounds());
}
//  $scope.map.setCenter(pos);
});	