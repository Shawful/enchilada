'use strict';

app.controller('loginCtrl', ['$scope', '$http', 'Auth', '$rootScope', '$injector', function (scope, http, Auth, $rootScope, $injector) {
// app.controller('loginCtrl', ['$scope', '$http', 'Auth', function (scope, http, auth) {
	    
    scope.awesomeThings = ['HTML5 Boilerplate', 'AngularJS', 'Karma'];
    scope.username = $rootScope.user.username;
    
    //remove this line of code for 1.0 release
    scope.password = $rootScope.user.password;
    
    
    
     scope.login = function()
     {
     	$rootScope.user.username = scope.username;
     	$rootScope.user.password = scope.password;
      //$rootScope.user.remember = scope.remember;
     	
     	Auth.login($rootScope.user, function(){}, function(){}); // function ()
   	 };

  }]);
