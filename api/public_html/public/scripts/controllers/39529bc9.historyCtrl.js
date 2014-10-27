'use strict';

app.controller('historyCtrl', [
    '$scope', '$http', '$rootScope', '$location', 'alertService', '$timeout',
    function($scope, $http, $rootScope, $location, alertService, $timeout) {
        $scope.loading = true;

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
            
            // change true to Yea and other to Nay
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
                    bills[i].bill.short_title = bills[i].bill.official_title.slice(0, 70);
                    //console.log(i);
                }
                //console.log(bills[i].bill.short_title);
            }
            $scope.bills = bills;
        }
        
        $scope.vote = function(vote, bill_id) {
            
            // show vote
            var firstDelay = 0,
                secondDelay = 1500,
                thirdDelay = 2000;
            var alertVoteText = '';

            var voteConfig = {
                method: "POST",
                url: $rootScope.urlRoot + '/user/bills/' + bill_id + '/' + vote,
                headers: {
                    'Content-Type': 'application/json'
                        //'x-auth': $rootScope.user.authtoken
                }
            };

            // send RESTful vote to server
            // on success flip down each $scope.rep[x].repworthiness in a for loop, update the value, then flip up.  
            // until the back end is functioning...
            $rootScope.vote = vote;

            $http(voteConfig).success(function(data) {
                $rootScope.$broadcast('voteCast');
            }).error(function(data) {
                console.log('error when voting!!!!');
                console.log(data);
            });

            // interpret vote binary
            var voteText;
            if (vote == 1) {
                voteText = "Yea";
            }
            else if (vote == 0) {
                voteText = "Nay";
            }

            // show alert
            $timeout(function() {
                alertService.add("success", "Thanks for changing your vote to " + voteText + "!");
            }, thirdDelay);
        };

        // change vote function
        $scope.changeVote = function(index) {
            var vote, digitalVote, bill_id;
            
            //get bill ID, current vote
            bill_id = $scope.bills[index].bill.bill_id;
            vote = $scope.bills[index].uservote;

            //flip vote
            if (vote == "Nay") {
                vote = "Yea";
                digitalVote = 1;
            }
            else if (vote == "Yea") {
                vote = "Nay";
                digitalVote = 0;
            }

            // update vote on UI
            $scope.bills[index].uservote = vote;

            //send new vote to back end server
            $scope.vote(digitalVote, bill_id);
        }


        // then request bill history
        $http.get($rootScope.urlRoot + '/user/bills?per_page=10').success(function(data) {
            //console.log(data);
            $scope.bills = data.bills;
            $scope.formatVotes($scope.bills);
            $scope.formatBillTitle($scope.bills);

            // stop the loading logo
            $scope.loading = false;

        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });


        $scope.$on('historyPageChange', function() {

            // start loading logo
            $scope.loading = true;

            // grab the next page number
            $scope.page = $rootScope.historyPage;
            // send off http request to get data
            $http.get($rootScope.urlRoot + '/user/bills?per_page=10&page=' + $scope.page).success(function(data) {
                $scope.bills = data.bills;
                $scope.formatVotes($scope.bills);
                $scope.formatBillTitle($scope.bills);

            // stop loading logo
            $scope.loading = false;

            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });

        });

    }
]);
