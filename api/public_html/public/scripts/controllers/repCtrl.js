'use strict';


app.controller('repCtrl', ['$scope', '$http', '$rootScope', '$location', '$filter', '$timeout',
        function($scope, $http, $rootScope, $location, $filter, $timeout) {

            //$http.defaults.transformResponse = [];

            $http.get('json/reps.json').success(function(data) {
                $scope.reps = data; // response data 
                $rootScope.reps = data;
            });

            // $scope.flipOut = false;
            // $scope.flipOut = $rootScope.flipOut;

            $scope.$on('voteCast', function() {
                    // console.log("Need to update the Repworthiness %s");
                    var vote = $rootScope.vote;
                    // console.log(vote);
                    // console.log($rootScope.vote);
                    // add a for loop and a $timeout function around the flip out = true to add cascade effect later :D
                    $scope.percentHide = true;

                    // $timeout(function(){
                      for (var i = 0; i < $scope.reps.length; i++) {
                        var newRepWorth = 0;
                        console.log(vote);
                        if ($rootScope.vote == 'nay') {
                            newRepWorth = angular.fromJson($scope.reps[i].repworthiness) - 1;
                            newRepWorth = $filter('number')(newRepWorth, 2);
                        } else if ($rootScope.vote == 'yay') {
                            newRepWorth = angular.fromJson($scope.reps[i].repworthiness) + 1;
                            newRepWorth = $filter('number')(newRepWorth, 2);
                        }

                        console.log("correct: " + newRepWorth);
                        console.log("before: " + $scope.reps[i].repworthiness);
                        $scope.reps[i].repworthiness = newRepWorth;
                        console.log("after: " + $scope.reps[i].repworthiness);
                    }
                    console.log("            ");
                    
                  // },100);
                    // $timeout(function(){$scope.percentHide = false; $scope.percentShow = true;},2100);
                    $timeout(function(){$scope.percentHide = false; }, 500);
                    $timeout(function(){$scope.percentShow = true; },1200);
                    //$scope.$apply();
                    //$scope.flipIn = true;
                        // console.log($scope.reps[0].repworthiness);
                        // var num = $scope.reps[0].stringify();
                        // num += 1;
                        // console.log($scope.reps[0].repworthiness);
                        // console.log($scope.reps);
                    });

            }
            ]);
