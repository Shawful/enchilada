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
		var loginConfig = {
            method:"POST",
            url: $rootScope.urlAuth,
            headers:{
                'Content-Type': 'application/json',
                "x-username": user.username,
                "x-password": user.password,
            }
        };

        $http(loginConfig).success(function(data){
            console.log("Logged in!");
            var $AuthToken = data.authToken,
                $Username = data.user.username;

            $http.defaults.headers.common['x-auth'] = $Authtoken;
            $rootScope.user = {'username':$Username, 'authtoken': $AuthToken};
            $cookieStore.put('user', $rootScope.user);
            $rootScope.user = user;
            
            //$rootScope.user.username = "";
            //$rootScope.user.isLogged = false;
            //$rootScope.user.role = $rootScope.userRoles.visitor;
            //$rootScope.$broadcast('logOut');
            //$location.path('/');

            $location.path('/home');

        }).error(function (data, status) {
            if (status === 401) {
                $rootScope.$broadcast('login_error', "hmmm...can't find that login combo.");
            }
        });

            //Jarvis code with Authtoken
            //login: function (login, success, error) {
            //$http({
            //url: $rootScope.urlAuth + '/api/login',
            //method: "POST",
            //timeout: 2000,
            //headers: {'Content-Type': 'text/plain', "x-ni-username": login.name, "x-ni-password": login.password}
            //}).success(function (data) {
            //var $AuthToken = data.authToken,
            //$Username = data.user.username,
            //$AccountId = data.accounts.accountId;
            //   var $xml = $(data),
            //   $AuthToken = $xml.find("AuthToken").text(),
            //   $Username = $xml.find("Username").text(),
            //   $AccountId = $xml.find("AccountId").text();
            //$rootScope.user = {'username': $Username, 'authtoken': $AuthToken, 'role': routingConfig.accessLevels.user, 'accountid': $AccountId};
            //$rootScope.userRole = routingConfig.accessLevels.user;
            //$cookieStore.put('user', $rootScope.user);
            //$http.defaults.headers.common['x-ni-authtoken'] = $rootScope.user.authtoken;
            //$location.path('/');
            //}).error(function (data, status) {
            //if (status === 401) {
            //$rootScope.$broadcast('login_error', "hmmm...can't find that login combo.");
            //}
            //});
            //},


            //Jarvis code without Authtoken
            //$rootScope.user.username = user.username;
    		//$rootScope.user.isLogged = true;
    		//$rootScope.user.role = $rootScope.userRoles.user;
    		//$rootScope.$broadcast('someoneLoggedIn');
			//console.log("$rootScope.user: " + angular.toJson($rootScope.user));
			//$location.path('/home');
        	      	
        	//$http.post('/login', user, config).success(function(user){
            //    $rootScope.user = user;
            //    success(user);
            //}).error(error);
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