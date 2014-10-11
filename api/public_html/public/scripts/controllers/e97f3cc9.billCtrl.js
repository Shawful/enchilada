'use strict';

angular.module('politicheckApp')
    .controller('billCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
            var searchPhrase = "health care";
            $rootScope.closeAlert = alertService.closeAlert;

            $http.get($rootScope.urlRoot + '/bills/search/?bill="' + searchPhrase + '"&per_page=5').success(function(data) {
                Search.setBills(data);
                $scope.bills = Search.getBills();
            });

            $scope.$on('newSearch', function() {
                //console.log(searchText);
                $scope.noData = false;
                //console.log('AHHH! cleared out error message');
                //console.log(searchText);

                console.log('test');
            });



            $rootScope.$on("search", function() {
                $scope.noData = false;
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
                // Insert RESTful call in the future to report bill to non interesting bills list on back end
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
        }
    ]);
