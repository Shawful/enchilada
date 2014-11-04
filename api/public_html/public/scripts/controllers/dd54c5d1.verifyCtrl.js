'use strict';

angular.module('politicheckApp')
    .controller('verifyCtrl', ['$scope', '$http', '$location', '$routeParams', '$rootScope', function($scope, $http, $location, $routeParams, $rootScope) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

       //$scope.accessCode = $routeParams.accessCode;
       console.log($routeParams.accessCode);

        $scope.error = false;

        var verifyConfig = {
            method: "POST",
            url: $rootScope.urlRoot + '/user/verify/' + $routeParams.accessCode,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // verify code
        $http(verifyConfig).success(function(data) {
        	$location.path('/login');

        }).error(function(data, status) {
        	$scope.error = true;
            console.log(data);
            console.log(status);
        });
    }]);
