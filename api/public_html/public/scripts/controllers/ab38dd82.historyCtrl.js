'use strict';

app.controller('historyCtrl', [
    '$scope', '$http', '$rootScope',
    '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {
        
        // get rep names immediately
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

        ////////////////////////////////////////////////
        //                                            //
        //              Functions                     //
        //                                            //
        ////////////////////////////////////////////////


        // format user vote function
        $scope.formatVotes = function(bills) {
            console.log(bills);
            for (var i = 0; i < bills.length; i++) {
                
                // modify user's vote
                if (bills[i].uservote == true) {
                    bills[i].uservote = "Yea";
                } else {
                    bills[i].uservote = "Nay";
                }

                // modify all reps' votes
                for (var j = 0; j < 3; j++) {
                    if (bills[i].senatorVotes[j].vote == "Not Voting") {
                        bills[i].senatorVotes[j].vote = "Abstained";
                    }
                }

            }
            $scope.bills = bills;
        }

        // format null bill titles function
        $scope.formatBillTitle = function(bills) {
            //console.log('made it to formatBillTitle function');
            //console.log(bills);
            for (var i = 0; i < bills.length; i++) {
                if (bills[i].bill.short_title == null) {
                    bills[i].bill.short_title = bills[i].bill.official_title.slice(0,70);
                    //console.log(i);
                }
                //console.log(bills[i].bill.short_title);
            }
            $scope.bills = bills;
        }

        // change vote function
        $scope.changeVote = function() {
            console.log('made it to change vote function');
            //console.log(index);
        }

        // then request bill history
        $http.get($rootScope.urlRoot + '/user/bills?per_page=10').success(function(data) {
            //console.log(data);
            $scope.bills = data.bills;
            $scope.formatVotes($scope.bills);
            $scope.formatBillTitle($scope.bills);
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
                $scope.formatVotes($scope.bills);
                $scope.formatBillTitle($scope.bills);
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });

        });

    }
]);
