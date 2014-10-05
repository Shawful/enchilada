'use strict';

/**
 * @ngdoc function
 * @name politicheckApp.controller:RegctrlCtrl
 * @description
 * # RegctrlCtrl
 * Controller of the politicheckApp
 */
app.controller('regCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];




        $scope.updateGeneralInfo = function() {

            $scope.validStepOne = false;

            $scope.validFirstName = false;
            $scope.validLastName = true;
            $scope.validEmail = false;
            $scope.validAge = false;
            $scope.validSex = false;


            if ($scope.$$childTail.firstName) {
                $scope.validFirstName = true;
            }
            if ($scope.$$childTail.lastName) {
                $scope.validLastName = true;
            }
            if ($scope.$$childTail.email) {
                $scope.validEmail = true;
            }
            if ($scope.$$childTail.age) {
                $scope.validAge = true;
            }
            if ($scope.$$childTail.sex) {
                $scope.validSex = true;
            }
            //console.log($scope.$$childTail.firstName.$error);
            //console.log($error);
            //console.log(firstname.$error);
            //console.log($scope.firstName.$error);
            //console.log($scope.$$childTail.$$childTail.registration.email.$valid);
            //console.log($scope);
            $scope.$$childTail.validStepOne = $scope.validFirstName && $scope.validLastName && $scope.validEmail && $scope.validAge && $scope.validSex;
        };


        $scope.validateContact = function() {
            console.log('first step completed!');

            $scope.updateLocationInfo = function() {
                $scope.validStepThree = false;

                $scope.validZipcode = false;

                if ($scope.$$childTail.zipcode) {
                    $scope.validZipcode = true;
                }
            }

            $scope.findReps = function() {
                // console.log('made it');
                // console.log($scope.$$childTail.address);
                // console.log($scope.$$childTail.zipcode);
                // console.log($scope);
                if ($scope.$$childTail.address) {
                    // send http request, send all reps to server, show rep names to user, enable the "Next" button
                    console.log("address entered");
                }
                else if ($scope.$$childTail.zipcode) {
                    // only zipcode given, show senator names to user, recenter map, enable map, wait for button selection...
                    console.log("zipcode entered");
                }

            }

        };
    }
]);
