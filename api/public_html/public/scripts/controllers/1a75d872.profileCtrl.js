'use strict';

angular.module('politicheckApp')
    .controller('profileCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
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
        }
    ]);
