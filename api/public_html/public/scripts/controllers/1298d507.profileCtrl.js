'use strict';

angular.module('politicheckApp')
    .controller('profileCtrl', ['$rootScope', '$scope', '$http', 
    	'alertService', '$filter', '$timeout', 'Search', '$location',
        function($rootScope, $scope, $http, alertService, 
        	$filter, $timeout, Search, $location) {
            $scope.senAFirstName = "";
            $scope.senALastName = "";
            $scope.senBFirstName = "";
            $scope.senBLastName = "";
            $scope.repFirstName = "";
            $scope.repLastName = "";

            // on load of page, get current rep names
            $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
                $scope.senAFirstName = data[0].first_name;
                $scope.senALastName = data[0].last_name;
                $scope.senBFirstName = data[1].first_name;
                $scope.senBLastName = data[1].last_name;
                $scope.repFirstName = data[2].first_name;
                $scope.repLastName = data[2].last_name;
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });

            // on load of page, get user profile data
            $http.get($rootScope.urlRoot + '/user/profile').success(function(data) {
                console.log('profile data');
                $scope.firstName = data.firstName;
                $scope.lastName = data.lastName;
                $scope.age = data.age;
                $scope.sex = data.sex;
                $scope.address = data.address;
                $scope.zipcode = data.zipcode;
                console.log(data);
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });


            $scope.returnHome = function(){
            	$location.path('/home');
            	//console.log('go home');
            };

            $scope.saveProfile = function(){
            	console.log('made it to save profile function');
            	// $http.put($rootScope.urlRoot + '/user/profile').success(function(data) {
            	
            	// }).error(function(data, status){

            	// });
            };
        }
    ]);
