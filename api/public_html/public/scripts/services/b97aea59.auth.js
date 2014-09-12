'use strict';

angular.module('politicheckApp')
	.factory('Auth', ['$http', '$rootScope', '$cookieStore', '$location', function Auth($http, $rootScope, $cookieStore, $location){
		
		return {

		authorize: function(accessLevel, role) {
            if(role === undefined)
                role = $rootScope.user.role;
            return accessLevel & role;
        },

        logMeIn: function(){
        	alert("working");
        },

        isLoggedIn: function(user) {
            if(user === undefined)
                user = $rootScope.user;
            return user.role === userRoles.user || user.role === userRoles.admin;
        },

        register: function(user, success, error) {
            // $http.post('/register', user).success(success).error(error);
        },

        login: function(user, success, error) {
        	
		$rootScope.user = user;
		

        	$rootScope.user.username = user.username;
    		$rootScope.user.isLogged = true;
    		$rootScope.user.role = $rootScope.userRoles.user;
    		$rootScope.$broadcast('someoneLoggedIn');
			//console.log("$rootScope.user: " + angular.toJson($rootScope.user));
			$location.path('/home');
        	      	
        	// $http.post('/login', user).success(function(user){
            //     $rootScope.user = user;
            //     success(user);
            // }).error(error);
        },

        logout: function(success, error) {
        	// $rootScope.user.
        	//alert($rootScope.user.username + "has been logged out");
        	$rootScope.user.username = "";
        	$rootScope.user.isLogged = false;
        	$rootScope.user.role = $rootScope.userRoles.visitor;
            $rootScope.$broadcast('logOut');
            $location.path('/');
    	
            // $http.post('/logout').success(function(){
            //     $rootScope.user = {
            //         username = '',
            //         role = userRoles.public
            //     };
            //     success();
            // }).error(error);
        },
    };
}]);