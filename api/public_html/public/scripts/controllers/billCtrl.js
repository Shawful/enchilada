'use strict';

angular.module('politicheckApp')
    .controller('billCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout',
        function($rootScope, $scope, $http, alertService, $filter, $timeout) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];

            $rootScope.closeAlert = alertService.closeAlert;

            $http.get('json/bills.json').success(function(data) {
                $scope.bills = data; // response data 
            });

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



            $scope.vote = function($index, vote) {
                // show vote
                //console.log(vote);
                var firstDelay = 0,
                    secondDelay = 1500,
                    thirdDelay = 2000;

                // remove bill element
                $timeout(function() {
                    $scope.remove($index);
                }, firstDelay);

                // send RESTful vote to server
                // on success flip down each $scope.rep[x].repworthiness in a for loop, update the value, then flip up.  
                // until the back end is functioning...
                $rootScope.vote = vote;
                $rootScope.$broadcast('voteCast');

                // $timeout(function() {
                //     $scope.updatePercentages(vote);
                // }, secondDelay);

                // show alert
                $timeout(function() {
                    alertService.add("success", "Thanks for voting " + vote + "!");
                }, thirdDelay);

                
            };
        }
    ]);
