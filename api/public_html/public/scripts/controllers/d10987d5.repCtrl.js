'use strict';


app.controller('repCtrl', ['$scope', '$http', '$rootScope', '$location', '$filter', '$timeout',
    function($scope, $http, $rootScope, $location, $filter, $timeout) {

        //$http.defaults.transformResponse = [];

        $http.get('json/reps.json').success(function(data) {
            $scope.reps = data; // response data 
            $rootScope.reps = data;
        });

        // get initial worthiness #s
        $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
            console.log(data);
            $scope.reps[0].repworthiness = data[0].worthiness;
            $scope.reps[1].repworthiness = data[1].worthiness;
            $scope.reps[2].repworthiness = data[2].worthiness;
            $rootScope.reps[0].repworthiness = data[0].worthiness;
            $rootScope.reps[1].repworthiness = data[1].worthiness;
            $rootScope.reps[2].repworthiness = data[2].worthiness;
        });
        // $scope.flipOut = false;
        // $scope.flipOut = $rootScope.flipOut;

        $scope.$on('voteCast', function() {
            // console.log("Need to update the Repworthiness %s");
            var vote = $rootScope.vote;
            var percentages = [];

            $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
                console.log('data rep id:' + data[0].bioguide_id);
                console.log('data rep %:' + data[0].worthiness);
                percentages[0] = data[0].worthiness;
                percentages[1] = data[1].worthiness;
                percentages[2] = data[2].worthiness;


                // console.log(vote);
                // console.log($rootScope.vote);
                // add a for loop and a $timeout function around the flip out = true to add cascade effect later :D
                $scope.percentHide = true;

                // $timeout(function(){
                for (var i = 0; i < $scope.reps.length; i++) {
                    var newRepWorth = [];
                    //console.log(vote);
                    //if ($rootScope.vote == 'nay') {
                    newRepWorth[i] = percentages[i];

                    console.log("percentages: " + percentages[i]);
                    console.log("newRepWorth: " + newRepWorth[i]);
                    //angular.fromJson($scope.reps[i].repworthiness) - 1;
                    //newRepWorth = $filter('number')(newRepWorth, 2);
                    //} else if ($rootScope.vote == 'yay') {
                    //    newRepWorth = percentages[i];
                    //newRepWorth = $filter('number')(newRepWorth, 2);
                    //}

                    //console.log("correct: " + newRepWorth);
                    console.log("before: " + $scope.reps[i].repworthiness);
                    $scope.reps[i].repworthiness = newRepWorth[i];
                    console.log("after: " + $scope.reps[i].repworthiness);
                }
                console.log("            ");

                // },100);
                // $timeout(function(){$scope.percentHide = false; $scope.percentShow = true;},2100);
                $timeout(function() {
                    $scope.percentHide = false;
                }, 500);
                $timeout(function() {
                    $scope.percentShow = true;
                }, 1200);
                //$scope.$apply();
                //$scope.flipIn = true;
                // console.log($scope.reps[0].repworthiness);
                // var num = $scope.reps[0].stringify();
                // num += 1;
                // console.log($scope.reps[0].repworthiness);
                // console.log($scope.reps);
            });

        })

    }
]);
