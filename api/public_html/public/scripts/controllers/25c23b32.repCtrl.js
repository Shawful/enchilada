'use strict';


app.controller('repCtrl', ['$scope', '$http', '$rootScope', '$location', '$filter', '$timeout',
    function($scope, $http, $rootScope, $location, $filter, $timeout) {
        var senA, senB, rep;
        //$http.defaults.transformResponse = [];

        // first make http call to get rep IDs and names and store in $rootScope

        // get initial data from JSON for testing
        //$http.get('json/reps.json').success(function(data) {
        

        // var reps = [{
        //     "role": "Senator",
        //     "congressmember": "SenatorA",
        //     "firstname": $rootScope.reps[0].firstName,
        //     "lastname": $rootScope.reps[0].lastName,
        //     "bioguideid": $rootScope.reps[0].bioguide_id,
        //     "repworthiness": 101
        // }, {
        //     "role": "Senator",
        //     "congressmember": "SenatorB",
        //     "firstname": $rootScope.reps[1].firstName,
        //     "lastname": $rootScope.reps[1].lastName,
        //     "bioguideid": $rootScope.reps[1].bioguide_id,
        //     "repworthiness": 101
        // }, {
        //     "role": "House Representative",
        //     "congressmember": "rep",
        //     "firstname": $rootScope.reps[2].firstName,
        //     "lastname": $rootScope.reps[2].lastName,
        //     "bioguideid": $rootScope.reps[2].bioguide_id,
        //     "repworthiness": 101
        // }]

        //get current % on load
        $rootScope.$broadcast('voteCast');

        // grab congress member images from another site until data URIs are available    
        // $http.get(' http://theunitedstates.io/images/congress/225x275/' + +'.jpg').success(function(data) {
        //     $scope.reps = data; // response data 
        //     $rootScope.reps = data;
        // }).error(function(data, status) {});



        // get initial worthiness #s from East Ballot server
        //$http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
        //console.log(data);
        //console.log('filter 0: ' + $filter('number')(data[0].worthiness, 1));
        //console.log('filter 1: ' + $filter('number')(data[1].worthiness, 1));
        //console.log('filter 2: ' + $filter('number')(data[2].worthiness, 1));

        // store values temporarily to capture rounding
        //   senA = $filter('number')(data[0].worthiness, 1);
        //   senB = $filter('number')(data[1].worthiness, 1);
        //   rep = $filter('number')(data[2].worthiness, 1);

        // assign rounded numbers
        //   $scope.reps[0].repworthiness = senA;
        //   $scope.reps[1].repworthiness = senB;
        //   $scope.reps[2].repworthiness = rep;
        //   $rootScope.reps[0].repworthiness = senA;
        //   $rootScope.reps[1].repworthiness = senB;
        //   $rootScope.reps[2].repworthiness = rep;
        //console.log($scope.reps[0].repworthiness);
        //console.log($scope.reps[1].repworthiness);
        //console.log($scope.reps[2].repworthiness);
        // });


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
                //

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
                    //newRepWorth[i] = Math.floor(newRepWorth[i]);
                    console.log(newRepWorth[i]);
                    newRepWorth[i] = $filter('number')(newRepWorth[i], 1); //newRepWorth.toFixed(1); //
                    console.log("percentages: " + percentages[i]);
                    console.log("newRepWorth: " + newRepWorth[i]);
                    //angular.fromJson($scope.reps[i].repworthiness) - 1;

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
