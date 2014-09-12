'use strict';

app.controller('loginCtrl', ['$scope', '$http', 'Auth', '$rootScope', '$injector', function (sc, http, Auth, $rootScope, $injector) {
// app.controller('loginCtrl', ['$scope', '$http', 'Auth', function (sc, http, auth) {
	    
    sc.awesomeThings = ['HTML5 Boilerplate', 'AngularJS', 'Karma'];
    
    
     sc.login = function()
     {
     	$rootScope.user.username = sc.username;
     	Auth.login($rootScope.user, function(){}, function(){}); // function ()
   	 };

  }]);
