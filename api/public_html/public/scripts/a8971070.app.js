'use strict';

var app = angular.module('politicheckApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute',
    'ui.bootstrap', 'ngAnimate', 'ui.keypress', 'mgo-angular-wizard',
    'angulike', 'angular-spinkit', 'angular-intro'
]);

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

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true).hashPrefix('!');
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
        .when('/tos', {
            templateUrl: 'views/tos.html',
            access: access.visitor
        })
        .when('/user/verify/:accessCode', {
            templateUrl: 'views/verify.html',
            access: access.visitor
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            access: access.user
        })
        .when('/history', {
            templateUrl: 'views/history.html',
            access: access.user
        });
    // .when('/logout', {
    //   templateUrl: 'views/logout.html',
    //   //controller: 'logoutCtrl',
    //   access: access.visitor
    // })

    // .otherwise({
    //   redirectTo: '/'
    // });
}]);

//$locationProvider.html5Mode(false);


app.run(['$rootScope', '$location', '$cookieStore', '$http', 'Auth', function($rootScope, $location, $cookieStore, $http, auth) {
    //$scope.$apply();
    console.log('before:');
    console.log($rootScope.user);
    $rootScope.facebookAppId = '345699855603648';
    // small ec2 instance below
    //$rootScope.urlRoot = 'http://ec2-54-172-95-254.compute-1.amazonaws.com:3000';
    $rootScope.urlRoot = '';
    $rootScope.lastSearch = "";
    // $rootScope.urlAuth = 'http://ec2-54-85-38-129.compute-1.amazonaws.com:3000/user/login';
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



    $rootScope.user = $cookieStore.get('user') || {
        username: '',
        isLogged: false,
        role: userRoles.visitor
    };
    //console.log ('username : ');
    console.log('after: ');
    console.log($rootScope.user);
    $http.defaults.headers.common['x-auth'] = $cookieStore.get('x-auth');
    //console.log('authtoken : ' + $cookieStore.get('x-auth'));

    // route user to home page if token is valid in cookie using our smallest $http request
    if ($rootScope.user.username === 'Guest') {
        //console.log('bad token!');//
        if ($cookieStore.get('token')) {
            console.log('the guest has been here before');
            auth.guestLogin();
            // $rootScope.user.username = 'Guest';
            // $rootScope.user.isLogged = true;
            // $rootScope.user.role = $rootScope.userRoles.user;
            // $rootScope.user.authtoken = $cookieStore.get('token');
            // $rootScope.user.password = '';
            // $rootScope.user.remember = '';
            // $rootScope.$broadcast('someoneLoggedIn');
            // $rootScope.$emit('someoneLoggedIn');
            // $location.path('/home');
        }
    } else {
        //console.log('valid token!');
        auth.login($rootScope.user, function() {}, function() {});
    }

    // $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {

    //   $location.path('/home');
    // }).error(function(data){

    // });

    // $rootScope.colors = ['#dcc539', '#e18041', "#3595f0", "#38ab3c", "#fd5a55"];
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        $rootScope.error = null;
        $rootScope.success = null;


        // if token is good, then set user role and redirect to home page
        // this should fix one of the cookie problems...



        // Check to see if the next page is public
        if (!(next.access & $rootScope.user.role)) {

            // Displays Root user info in console
            //console.log("$rootScope.user: " + angular.toJson($rootScope.user));

            // Check if the current user has a profile or is an admin
            if (($rootScope.user.role === userRoles.user || $rootScope.user.role === userRoles.admin)) {
                // console.log("test: " + userRole.user);
                $location.path('/');
            } else {
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
