app.controller('mapController',function ($scope, $rootScope, $routeParams, $location, $http,$cookieStore,Data) {
var placeSearch, autocomplete;
$scope.map;
$scope.initAutocomplete = function () {
	console.log("this function called");
   $scope.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6,
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
  console.log(pos);
   var marker = new google.maps.Marker({
    position: pos,
    map: $scope.map,//map,//$scope.map,
    title: "you are searched place"
  });
 marker.setMap($scope.map);
 $scope.map.setCenter(pos);
 }
$scope.setMarker = function(pos,title){
 var marker = new google.maps.Marker({
    position: pos,
    map: $scope.map,//map,
    title: title
  });
 marker.setMap($scope.map);
 $scope.map.setCenter(pos);
}
$scope.geolocate = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
     console.log(geolocation);
     $scope.setMarker(geolocation,"your default location");
     // setMarker(geolocation,"your's place.");
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }else{
    console.log("coming here to else block");
  }
}
});