app.factory("Data", ['$http',
    function ($http) { 

        var serviceBase = 'http://localhost:3000';
        var jsonData = {};

        jsonData.get = function (query) {
            return $http.get(serviceBase + query).then(function (results) {
                return results.data;
            });
        };

        jsonData.post = function (query, object) {
            return $http.post(serviceBase + query, object).then(function (results) {
                return results.data;
            });
        };

        jsonData.put = function (query, object) {
            return $http.put(serviceBase + query, object).then(function (results) {
                return results.data;
            });
        };

        jsonData.delete = function (query) {
            return $http.delete(serviceBase + query).then(function (results) {
                return results.data;
            });
        };

        jsonData.getService = function(url){

            return $http.get(url).then(function(results){
                 return results.data;
            });
        }

        return jsonData;
}]);