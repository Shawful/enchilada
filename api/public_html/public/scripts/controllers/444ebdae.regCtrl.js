'use strict';

/**
 * @ngdoc function
 * @name politicheckApp.controller:RegctrlCtrl
 * @description
 * # RegctrlCtrl
 * Controller of the politicheckApp
 */
app.controller('regCtrl', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {
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
                $scope.address = $scope.$$childTail.address.replace(/ /g, '+');
                $scope.zipcode = JSON.stringify($scope.$$childTail.zipcode);

                var addressConfig = {
                    method: "POST",
                    url: $rootScope.urlRoot + '/user/legislators',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        'streetAddress': $scope.address,
                        'zipcode': $scope.zipcode
                    }
                };

                // if the address is entered, try and get all rep info
                if ($scope.$$childTail.address) {
                    // send http request with address to get reps
                    $http(addressConfig).success(function(data) {

                        //send all reps to server

                        //find out which is house rep and which are senators
                        if (data.results.length == 3) {
                            
                            //find house rep
                            for ($scope.i = 0; $scope.i < data.results.length; $scope.i++) {
                              if (data.results[$scope.i].chamber == "house")
                                $scope.repIndex = $scope.i;
                            };
                            
                            

                        }

                        //show rep names to user
                        $scope.$$childTail.senatorA = data.results[0].first_name + ' ' + data.results[0].last_name;
                        $scope.$$childTail.senatorB = data.results[1].first_name + ' ' + data.results[1].last_name;
                        $scope.$$childTail.rep = data.results[$scope.repIndex].first_name + ' ' + data.results[$scope.repIndex].last_name;


                        //enable the "Next" button


                        //console.log("address entered");
                        //console.log(data);
                        // var $authToken = data.token;
                    }).error(function(data, status) {
                        if (status === 404) {
                            console.log('bad zipcode');
                            alertService.add('zipcode_error', "Sorry, incorrect zipcode.");
                        }
                        if (status === 400) {
                            console.log('bad body format');
                        }
                        if (status === 500) {
                            console.log('WTF MATE?!');
                        }
                    });


                } else if ($scope.$$childTail.zipcode) {
                    // only zipcode given, show senator names to user, recenter map, enable map, wait for button selection...
                    console.log("zipcode entered");
                }

            }

        };
    }
]);
