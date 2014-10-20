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
        $scope.formatUserVote = function(bills) {
            console.log(bills);
            for (var i = 0; i < bills.length; i++) {
                if (bills[i].uservote == true) {
                    bills[i].uservote = "Yea";
                } else {
                    bills[i].uservote = "Nay";
                }
            }
            $scope.bills = bills;
        }

        // format reps' votes function
        $scope.formatRepVotes = function(bills) {
            console.log(bills);
            for (var i = 0; i < bills.length; i++) {
                if (bills[i].senatorVotes[0].vote == "") {
                    bills[i].senatorVotes[0].vote = "-";
                }
                if (bills[i].senatorVotes[0].vote == null) {
                    bills[i].senatorVotes[0].vote = "-";
                }
                if (bills[i].senatorVotes[1].vote == "") {
                   bills[i].senatorVotes[1].vote = "-";
                }
                if (bills[i].senatorVotes[1].vote == null) {
                    bills[i].senatorVotes[1].vote = "-";
                }
                if (bills[i].senatorVotes[2].vote == "") {
                    bills[i].senatorVotes[2].vote = "-";
                } 
                if (bills[i].senatorVotes[2].vote == null) {
                    bills[i].senatorVotes[2].vote = "-";
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

        $scope.$on('historyPageChange', function() {
            // grab the next page number
            $scope.page = $rootScope.historyPage;

            // send off http request to get data
            $http.get($rootScope.urlRoot + '/user/bills?per_page=10&page=' + $scope.page).success(function(data) {
                $scope.bills = data.bills;
                $scope.formatUserVote($scope.bills);
                $scope.formatRepVotes($scope.bills);
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });

        });

    }
]);
