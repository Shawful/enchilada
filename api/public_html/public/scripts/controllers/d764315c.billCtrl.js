'use strict';

angular.module('politicheckApp')
    .controller('billCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
            $scope.noData = false;
            $scope.numberOfResults = 0;
            $scope.billSummary = "bill details loading...";
            var searchPhrase = "health care";
            $rootScope.closeAlert = alertService.closeAlert;
            $scope.share = {
                Name: "EasyBallot.org",
                ImageUrl: 'http://www.easyballot.org'
            };

            // get the bills that the user first sees when they log in
            $http.get($rootScope.urlRoot + '/bills/recent').success(function(data) {
                //console.log("just got the most recent bills");
                var shortData = data.results.slice(0, 5);
                var newData = {
                    results: shortData
                };
                $rootScope.lastSearch = "";
                $rootScope.numberOfResults = data.count;
                $scope.numberOfResults = data.count;
                Search.clearBills();
                Search.setBills(newData);
                $rootScope.$broadcast('search');

            }).error(function(data, status) {
                console.log('got an error trying to get the most recent bills');
                console.log(data);
            });
            // $http.get($rootScope.urlRoot + '/bills/search/?bill="' + searchPhrase + '"&per_page=5').success(function(data) {
            //     Search.setBills(data);
            //     $scope.bills = Search.getBills();
            // });



            $scope.$on('newSearch', function() {
                //console.log(searchText);
                $scope.noData = false;
                $scope.numberOfResults = $rootScope.numberOfResults;
                $timeout(function() {
                    $scope.bills = Search.getBills();
                }, 20);
                //console.log('AHHH! cleared out error message');
                //console.log(searchText);
            });



            $rootScope.$on("search", function() {
                $scope.noData = false;
                $scope.numberOfResults = $rootScope.numberOfResults;
                console.log('made it to bill Ctrl: ' + $scope.numberOfResults);
                $timeout(function() {
                    $scope.bills = Search.getBills();
                }, 900); // add delay before displaying new bills.
            });


            $scope.$on('noData', function() {
                //console.log('made it to the landing controller');
                $scope.noData = true;
                //console.log($scope.noData);
                // console.log("Someone Logged in: " + sc.isLoggedIn);
            });

            // Functions ////////////////////////////////////////////////////////
            $scope.remove = function($index) {
                    $scope.bills.splice($index, 1);
                    if ($scope.bills.length == 0) {
                    console.log('out of bills!');
                    $rootScope.$emit('outOfBills');
                }
                // Insert RESTful call in the future to report bill to non interesting bills list on back end
        };

        $scope.getBillSummary = function($index, bill_id) {
            console.log('title clicked');
            // $rootScope.urlRoot + '/bills/search/?bill="' + searchPhrase + '"&per_page=5'

            //$scope.billSummary = "Shawn made this work";
            $http.get($rootScope.urlRoot + '/bills/summary/' + bill_id).success(function(data) {
                //console.log(data);
                if (data[0].summary_short) {
                    $scope.billSummary = data[0].summary_short;
                } else {
                    $scope.billSummary = "Unfortunately, this bill is not yet out of committee, and we are still waiting for the summary from the bill's authors.";
                }
                console.log(data);
                //var n = $scope.billSummary.search("...");
                var l = $scope.billSummary.length;
                // check to see if a bill's short summary has "..." at the end and exceeds 1000 characters
                if (l == 1004) {
                    //console.log(n);
                    console.log("length: " + l);
                    console.log("there is a long version of this bill");

                    // add code to insert link to longer version of bill (and open in another tab)                        
                    //var test = "<a href=''>THIS IS A TEST</a>";
                    //$scope.billSummary = $scope.billSummary.concat(test);
                    //console.log($scope.billSummary);
                } else {
                    console.log("short summary only");
                    //console.log(n);
                    console.log("length: " + l);
                }
            }).error(function(data, status) {
                $scope.billSummary = "Bill summary not present or an error occurred";
            });
        };

        $scope.vote = function($index, vote, bill_id) {
            // show vote
            //console.log(vote);
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

            // var revoteConfig = {
            //     method:"PUT",
            //     url: $rootScope.urlRoot + '/user/bills/' + bill_id + '/' + vote,
            //     headers:{
            //         'Content-Type': 'application/json'
            //         //'x-auth': $rootScope.user.authtoken
            //     }
            // };

            // remove bill element
            $timeout(function() {
                $scope.remove($index);
            }, firstDelay);

            // send RESTful vote to server
            // on success flip down each $scope.rep[x].repworthiness in a for loop, update the value, then flip up.  
            // until the back end is functioning...
            $rootScope.vote = vote;


            $http(voteConfig).success(function(data) {
                console.log('Voted!!!!');
                $rootScope.$broadcast('voteCast');
                // $timeout(
                //     $rootScope.$broadcast('voteCast'), 400);

            }).error(function(data) {
                // $http(revoteConfig).success(function(data){
                console.log('error when voting!!!!');
                console.log(data);
            });

            //});



            /////////////////

            // $timeout(function() {
            //     $scope.updatePercentages(vote);
            // }, secondDelay);

            // show alert
            if (vote == '1') {
                alertVoteText = 'yay';
            } else {
                alertVoteText = 'nay';
            }
            $timeout(function() {
                alertService.add("success", "Thanks for voting " + alertVoteText + "!");
            }, thirdDelay);


        };
    }]);
