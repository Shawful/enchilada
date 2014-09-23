'use strict';

app.controller('loginCtrl', ['$scope', '$http', 'Auth', '$rootScope', '$injector', '$cookieStore', function (scope, http, Auth, $rootScope, $injector, $cookieStore) {
// app.controller('loginCtrl', ['$scope', '$http', 'Auth', function (scope, http, auth) {
	    
    scope.awesomeThings = ['HTML5 Boilerplate', 'AngularJS', 'Karma'];
    if (typeof $cookieStore.get('user') == "undefined")
    {
      console.log('no cookie!');
    }
    else 
    {
      scope.username = $rootScope.user.username || $cookieStore.get('user').username;
      scope.remember = $rootScope.user.remember || $cookieStore.get('user').remember;
    
      //remove this line of code for 1.0 release
      scope.password = $rootScope.user.password || $cookieStore.get('user').password;
    }
    
    
    
     scope.login = function()
     {
     	$rootScope.user.username = scope.username;
     	$rootScope.user.password = scope.password;
      $rootScope.user.remember = scope.remember;
     	
     	Auth.login($rootScope.user, function(){}, function(){}); // function ()
   	 };

  }]);
