var app = angular.module('UberApp', ['ngRoute', 'ngAnimate','ngCookies']);

app.config(['$routeProvider',
  function ($routeProvider) {
        $routeProvider.
        when('/login', {
            title: 'Login',
            templateUrl: 'partials/login.html',
            controller: 'authCtrl'
        })
            .when('/signup', {
                title: 'Signup',
                templateUrl: 'partials/signup.html',
                controller: 'authCtrl'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'partials/dashboard.html',
                controller: 'mapController'//'authCtrl'
            })
            .when('/driverdashboard',{
                title:'Dashboard',
                templateUrl:'partials/driverdashboard.html',
                controller:'mapController'
            })
            .when('/signupdriver',{
               title: 'Signup',
                templateUrl: 'partials/signupDriver.html',
                controller: 'authCtrl' 
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'partials/login.html',
                controller: 'authCtrl',
                role: '0'
            })
            .when('/forgot',{
                title:'Forgot',
                templateUrl:'partials/forgot.html',
                controller:'authCtrl',
            })
            .when('/mobileconfirm',{
                title:'Mobile Confirmation',
                templateUrl:'partials/mobileConfirm.html',
                controller:'authCtrl'
            })
             .when('/maplocations',{
              title:'map sample locations',
              templateUrl:'partials/mapLocations.html',
              controller:'mapCtrl'
            })
            .when('/mobilenum',{
                title:'Mobile Number',
                templateUrl:'partials/mobileNum.html',
                controller:'authCtrl'
            })
            .otherwise({
                redirectTo: '/login'
            });
  }])
    .run(function ($rootScope, $location,$cookieStore, Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
         /*   
         $cookieStore.put('sampleobj',{"name":"sample","last":"test"});
            console.log("sample obj is");
            console.log($cookieStore.get('sampleobj'));
            */
            $rootScope.login_status = ($cookieStore.get('login'))?true:false;

       //     $rootScope.loginStatus = ($rootScope.loginStatus + 1) || 1;
         
            console.log("Login Status:"+$rootScope.login_status);

            console.log($cookieStore.get('user'));

            if($cookieStore.get('user')){
                $rootScope.userinfo =  $cookieStore.get('user') || {};
            }
            $rootScope.userinfo = $rootScope.userinfo||{};
            console.log($rootScope.userinfo);
      //      var userobj = $cookieStore.get('user');
      //      console.log("I am from cookie object");
      //      console.log(userobj);
           var url = next.$$route.originalPath;
           console.log(url);
           
           if(url == "/maplocations"){

           } 
           else if(($rootScope.userinfo)&&($rootScope.userinfo._id)&&($rootScope.userinfo.phonenumber)&&($rootScope.userinfo.confirm)&&($rootScope.userinfo.mconfirm)){
           // based on usertype you can redirect to which dashboard.
           if($rootScope.userinfo.usertype == "P"){
                $location.path("/dashboard");
           }else{
                $location.path("driverdashboard");
           }
           }else if(!(($rootScope.userinfo)&&($rootScope.userinfo._id))){
            $location.path("/");
           }else if(!($rootScope.userinfo.confirm)){
            alert("Please confirm Your email address and login again");
            $location.path("/login");
           }else if(!($rootScope.userinfo.phonenumber)){
            $location.path("/mobilenum");
           }else if(!($rootScope.userinfo.mconfirm)){
            $location.path("/mobileconfirm");
           }else{
            $location.path("/login");
           }
          
            if(url == '/mobileconfirm' || url == '/mobilenum'){ // || url == '/dashboard'
                if($rootScope.userinfo._id){

                }else{
                    $location.path("/login");
                }
            }
          //  $rootScope.authenticated = false;
      //      $location.path("/login");
        /* 
           Data.get('session').then(function (results) {
                if (results.uid) {
                    $rootScope.authenticated = true;
                    $rootScope.uid = results.uid;
                    $rootScope.name = results.name;
                    $rootScope.email = results.email;
                } else {
                    var nextUrl = next.$$route.originalPath;
                    if (nextUrl == '/signup' || nextUrl == '/login') {

                    } else {
                        $location.path("/login");
                    }
                }
            });
        */
        });
    });