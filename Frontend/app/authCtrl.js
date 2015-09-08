app.controller('authCtrl', function ($scope, $rootScope, $routeParams, $location, $http,$cookieStore,Data) {
    //initially set those objects to null to avoid undefined error
    $scope.login = {};
    $scope.signup = {};
    $scope.umobile = {};
    $scope.userdata = {};
    $scope.forgot = {};
    $scope.passenger = true;
    $scope.doLogin = function (customer) {
        console.log(customer);
        
       Data.post('/login/passenger', 
            customer
        ).then(function (results) {
            if (results.status == "success") {
                $rootScope.userinfo = results.userdata;
                $cookieStore.put('user',$rootScope.userinfo);
                if(results.userdata&&(!(results.userdata.confirm))){
                    alert("Please confirm your emailaddress.");
                }else if(results.userdata && (!(results.userdata.phonenumber))){
                    $location.path('mobilenum');
                }else if(!(results.userdata.mconfirm)){
                    $location.path('mobileconfirm');
                }else{
                    $location.path('dashboard');
                }
            //    console.log(results)
              //  $location.path('dashboard');
            }else{
                console.log("error results");
                console.log(results);
                alert(results.msg);
            }
        });
    };
    
    $scope.signup = {email:'',password:'',username:'',phonenumber:''};
    $scope.signUp = function (customer) {
        if(customer.licenceId){
         customer.usertype = "D";
        }else{
            customer.usertype = "P";
        }
        console.log(customer);
        Data.post('/insertuser',
            customer
        ).then(function(results){
            if(results.status == "success"){
                $rootScope.userinfo = results.data;
                 $cookieStore.put('user',$rootScope.userinfo);
                alert("Rigistration successfull Please confirm your email and mobile number and login to continue.");
               $location.path('login');
               /* 
               if(results.data && (!(results.data.phonenumber))){
                    $location.path('mobilenum');
                }else if(!(results.data.mconfirm)){
                    $location.path('mobileconfirm');
                }else if(results.data&&(!(results.data.confirm))){
                    alert("Please confirm your emailaddress.");
                }else{
                    $location.path('dashboard');
                }
                */
            }else{
                alert(results.msg);
            }
        });
      /* 
       Data.post('signUp', {
            customer: customer
        }).then(function (results) {
            if (results.status == "success") {
                $location.path('dashboard');
            }
        });
*/
    };
    $scope.doForgot = function(customer){
        console.log(customer);
        Data.post('/forgotpassword',
            customer
        ).then(function(results){
            if(results.status == "success"){
             //   console.log(results);
             alert(results.msg);
           //  $location.path('');
            }else{
                alert(results.msg);
            }
        });
    };
    $scope.doConfirm = function(data){
        console.log(data);
        console.log($rootScope.userinfo);
        var customer = {};
        customer._id = $rootScope.userinfo._id;
        customer.phonenumber = $rootScope.userinfo.phonenumber;
        customer.email = $rootScope.userinfo.email;
        customer.mconfid = data.mconfirm;
        Data.post('/verify/mobile',
            customer
        ).then(function(results){
            if(results.status == "success"){
                console.log(results);
                $rootScope.userinfo.mconfirm = true;
                $cookieStore.put('user',$rootScope.userinfo);
                alert(results.msg);
                $location.path('dashboard');
            }else{
                alert(results.msg);
            }
        });
    };
    $scope.doMobileNumUpdate = function(data){
        var customer = {};
         customer._id = $rootScope.userinfo._id;
        customer.phonenumber = data.mobilenumber;
        if($scope.passenger){
            customer.usertype = "P";
        }else{
            customer.usertype = "D";
        }
        console.log(customer);
        Data.post('/update/mobilenumber',
            customer
        ).then(function(results){
            if(results.status == "success"){
                console.log(results);
                $rootScope.userinfo.phonenumber = customer.phonenumber;
                alert(results.msg);
                $cookieStore.put('user',$rootScope.userinfo);
                $location.path('mobileconfirm');
            }else{
                alert(results.msg);
            }
        });
    };
      $scope.changeUsertype = function(data){
        $scope.passenger = data.passenger;
      }
    $scope.doDriverDataUpdate = function(data){
        var customer = data;
         customer._id = $rootScope.userinfo._id;
         customer.phonenumber = data.mobilenumber;
        if($scope.passenger){
            customer.usertype= "P";
        }else{
            customer.usertype = "D";
        }
        console.log(customer);
        Data.post('/update/driverdetails',
            customer
        ).then(function(results){
            if(results.status == "success"){
                console.log(results);
                $rootScope.userinfo.phonenumber = customer.phonenumber;
                $rootScope.userinfo.licenceId = customer.licenceId;
                $rootScope.userinfo.vnumber = customer.vnumber;
                $rootScope.userinfo.ctype = customer.ctype;
                $rootScope.userinfo.usertype = customer.usertype;
                $cookieStore.put('user',$rootScope.userinfo);
                alert(results.msg);
                $location.path('mobileconfirm');
            }else{
                alert(results.msg);
            }
        });
    }
});