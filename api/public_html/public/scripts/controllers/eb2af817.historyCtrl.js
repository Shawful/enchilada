'use strict';

app.controller('historyCtrl', [
    '$scope', '$http', '$rootScope',
    '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {
        // get rep names immediately
        $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
            //console.log(data);
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

        // format user vote function
        $scope.formatUserVote = function (bills) {
        	for (var i = 0; i < bills.length; i++){
        		if (bills[i].uservote == true){
        			bills[i].uservote = "Yay";
        		}
        		else {
        			bills[i].uservote = "Nay";
        		}
        	}
        	$scope.bills = bills;
        }

        // then request bill history
        $http.get($rootScope.urlRoot + '/user/bills?per_page=10').success(function(data) {
            //console.log(data);
            $scope.bills = data.bills;
            $scope.formatUserVote($scope.bills);
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

    }
]);
