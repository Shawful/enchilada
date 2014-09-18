'use strict';

var app = angular.module('politicheckApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ngAnimate']);

    var userRoles = {
        visitor: 1, // 001
        user: 2, // 010
        admin: 4 // 100
    };

    var accessLevels = {
        any: 7, // 111
        visitor: 1, // 001
        user: 6, // 110
        admin: 4 // 100
    };

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    var access = accessLevels;
    $routeProvider
      .when('/', {
        templateUrl: 'views/landing.html',
        //controller: 'loginCtrl',
        access: access.visitor
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        access: access.user
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        access: access.visitor
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        access: access.user
      })
      .when('/contact', {
        templateUrl: 'views/home.html',
        access: access.user
      })
      .when('/register', {
        templateUrl: 'views/login.html',
        access: access.visitor
      })
      // .when('/logout', {
      //   templateUrl: 'views/logout.html',
      //   //controller: 'logoutCtrl',
      //   access: access.visitor
      // })
      .otherwise({
        redirectTo: '/'
      });
  }]);

//$locationProvider.html5Mode(false);


app.run(['$rootScope', '$location', '$cookieStore', 'Auth', function ($rootScope, $location, $cookieStore, auth) {
        //$scope.$apply();
        // $rootScope.urlRoot = 'http://jarvis-dev.niwsc.com/deviceapi-2.0/rest';
        $rootScope.urlAuth = 'http://ec2-54-85-38-129.compute-1.amazonaws.com:3000/user/login';
        // $rootScope.urlKeyService = 'http://jarvis-dev.niwsc.com/keyservices-1.0/rest'
        // $rootScope.urlSocket = 'http://jarvis-dev.niwsc.com:80';
        
        $rootScope.userRoles = {
        visitor: 1, // 001
        user: 2, // 010
        admin: 4 // 100
        };
        $rootScope.accessLevels = {
        any: 7, // 111
        visitor: 1, // 001
        user: 6, // 110
        admin: 4 // 100
        };
        $rootScope.user = $cookieStore.get('user') || {username: '', isLogged: false, role: userRoles.visitor};

        // $rootScope.colors = ['#dcc539', '#e18041', "#3595f0", "#38ab3c", "#fd5a55"];
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.error = null;
        $rootScope.succes = null;

            // Check to see if the next page is public
             if (!(next.access & $rootScope.user.role)) {
                                
                // Displays Root user info in console
                // console.log("$rootScope.user: " + angular.toJson($rootScope.user));

                // Check if the current user has a profile or is an admin
                if ($rootScope.user.role === userRoles.user || $rootScope.user.role === userRoles.admin) {
                  // console.log("test: " + userRole.user);
                  $location.path('');
                }
                else
                {
                  $location.path('/login');
                }
                //    if (!auth.authorize(next.access))
                //    {
                //     if (auth.isLoggedIn()) $location.path('/');
                //     else                   $location.path('/');
                }
        });

        // $rootScope.appInitialized = true;
}]);