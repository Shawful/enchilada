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

            $rootScope.$on("search", function () {
                $scope.bills = Search.getBills();
            });
            //console.log($scope.bills);
            //Search.getBills();
            //console.log('bills controller: ');
            //console.log(Search.getBills()[0].short_title);

            //$scope.bills = Search.getBills();
            //Search = $scope.bills;
            //$scope.bills
            //$scope.bills = Search;
            
            // $scope.init = function()
            // {
            //     $http.get($rootScope.urlRoot + '/bills/search/?bill="health care"&per_page=5').success(function(data) {
            //     $scope.bills = data; // response data 
            // });

            // }
                        //Search.getBills("war");
            //console.log(Search.getBills("health care"));//[0].short_title));
            //.getBills("health care");
            //$scope.bills=Search.getBills("test");
            //console.log($scope.bills);

            // $http.get($rootScope.urlRoot + '/bills/search/?bill="health care"&per_page=5').success(function(data) {
            //     $scope.bills = data; // response data 
            // });

            // $rootScope.reps = $scope.resp;
            // console.log(angular.fromJon($scope.reps));
            // var one = angular.fromJson($scope.reps[0].repworthiness);
            //     //two = $rootScope.reps[1].repworthiness,
            //     //three = $rootScope.reps[2].repworthiness;
            // $scope.$watch('one', function() {
            //     console.log('value 1 changed');
            // });
            // $scope.$watch('two', function() {
            //     console.log('value 2 changed');
            // });
            // $scope.$watch('three', function() {
            //     console.log('value 3 changed');
            // });

            // Functions ////////////////////////////////////////////////////////
            $scope.remove = function($index) {
                $scope.bills.splice($index, 1);
                // Insert RESTful call in the future to report bill to non interesting bills list on back end
            };

            // Using $rootScope.emit('voteCast'); instead!
            // $scope.updatePercentages = function(vote) {
            //     for (var i = 0; i < $scope.reps.length; i++) {
            //         var newRepWorth = 0;
            //         //console.log($scope.reps[i].repworthiness);
            //         $scope.flipOut = true;
            //         if (vote == 'nay') {
            //             newRepWorth = angular.fromJson($scope.reps[i].repworthiness) - 1;
            //             newRepWorth = $filter('number')(newRepWorth, 2);
            //         } else if (vote == 'yay') {
            //             newRepWorth = angular.fromJson($scope.reps[i].repworthiness) + 1;
            //             newRepWorth = $filter('number')(newRepWorth, 2);
            //         }
            //         //console.log(newRepWorth);
            //         $scope.reps[i].repworthiness = newRepWorth;
            //         $scope.$apply();
            //     }
            // };



            $scope.vote = function($index, vote, bill_id) {
                // show vote
                //console.log(vote);
                var firstDelay = 0,
                    secondDelay = 1500,
                    thirdDelay = 2000;
                var alertVoteText='';

                var voteConfig = {
                    method:"POST",
                    url: $rootScope.urlRoot + '/user/bills/' + bill_id + '/' + vote,
                    headers:{
                        'Content-Type': 'application/json'
                        //'x-auth': $rootScope.user.authtoken
                    }
                };

                var revoteConfig = {
                    method:"PUT",
                    url: $rootScope.urlRoot + '/user/bills/' + bill_id + '/' + vote,
                    headers:{
                        'Content-Type': 'application/json'
                        //'x-auth': $rootScope.user.authtoken
                    }
                };

                // remove bill element
                $timeout(function() {
                    $scope.remove($index);
                }, firstDelay);

                // send RESTful vote to server
                // on success flip down each $scope.rep[x].repworthiness in a for loop, update the value, then flip up.  
                // until the back end is functioning...
                $rootScope.vote = vote;

                // insert code to cast vote and send vote to EasyBallot server
                //console.log(bill_id);
                //console.log('url : ' + voteConfig.url);
                
                //console.log($http.defaults.headers.commons['x-auth']);
                //console.log($rootScope.user.authtoken);
                //console.log(voteConfig.headers['x-auth']);
                //console.log($http.defaults.headers.common['x-auth']);
                //console.log($rootScope);
                
                $http(voteConfig).success(function(data){
                    console.log('Voted!!!!');
                }).error(function(data){
                    $http(revoteConfig).success(function(data){
                    console.log('ReVoted!!!!');
                });
                
                });



                $rootScope.$broadcast('voteCast'); /////////////////

                // $timeout(function() {
                //     $scope.updatePercentages(vote);
                // }, secondDelay);

                // show alert
                if (vote == '1'){
                    alertVoteText='yay';
                }
                else{
                    alertVoteText='nay';
                }
                $timeout(function() {                                                    
                    alertService.add("success", "Thanks for voting " + alertVoteText + "!");      
                }, thirdDelay);                                                          

                
            };
        }
    ]);
