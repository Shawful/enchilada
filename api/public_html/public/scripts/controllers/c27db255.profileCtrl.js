'use strict';

angular.module('politicheckApp')
    .controller('profileCtrl', ['$rootScope', '$scope', '$http',
        'alertService', '$filter', '$timeout', 'Search', '$location',
        function($rootScope, $scope, $http, alertService,
            $filter, $timeout, Search, $location) {
            $scope.senAFirstName = "";
            $scope.senALastName = "";
            $scope.senBFirstName = "";
            $scope.senBLastName = "";
            $scope.repFirstName = "";
            $scope.repLastName = "";

            // on load of page, get current rep names
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

            // on load of page, get user profile data
            $http.get($rootScope.urlRoot + '/user/profile').success(function(data) {
                console.log('profile data');
                $scope.firstName = data.firstName;
                $scope.lastName = data.lastName;
                $scope.age = data.age;
                $scope.sex = data.sex;
                $scope.address = data.address;
                $scope.zipcode = data.zipcode;
                $scope.share = data.share;
                $scope.filters = data.filters;
                //console.log($scope.filters);
                console.log(data);
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });


            $scope.returnHome = function() {
                $location.path('/home');
                //console.log('go home');
            };

            $scope.saveProfile = function() {
                console.log('made it to save profile function');
                // $http.put($rootScope.urlRoot + '/user/profile').success(function(data) {

                // }).error(function(data, status){

                // });
            };

            $scope.districtChosen = function($index) {
                // determine which button was pressed to select a district (and house rep)

                // set district selection info for final registration http request
                $scope.state = $scope.districts[$index].state;
                $scope.district = $scope.districts[$index].district;

                // update house rep display for user
                $scope.rep = $scope.districts[$index].first_name + ' ' + $scope.districts[$index].last_name;

                // add chosen house rep's ID to rep ID array
                $scope.reps[2] = $scope.districts[$index].bioguide_id;
            };

            $scope.findReps = function() {
            console.log('made it');
            
            $scope.address = "";
            $scope.zipcode = "";
            $scope.showMap = false;
            $scope.pickDistrict = false;
            $scope.showDistricts = false;

            var sendAddressConfig = {
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

            var sendRepsConfig = {
                method: "POST",
                url: $rootScope.urlRoot + '/user/reps',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: []
            };

            // if the address is entered, try and get all rep info
            if ($scope.address) {

                //grab data from form and replace ' ' with '+' in address
                $scope.address = $scope.address.replace(/ /g, '+');
                $scope.zipcode = $scope.zipcode;

                //add zipcode and address in body of http request
                sendAddressConfig.data = {
                    'streetAddress': $scope.address,
                    'zipcode': $scope.zipcode
                };

                // send http request with address to get rep names and bioguide_ids
                $http(sendAddressConfig).success(function(data) {

                    //find out which is house rep and which are senators
                    if (data.results.length == 3) {

                        //find house rep
                        for ($scope.i = 0; $scope.i < data.results.length; $scope.i++) {
                            if (data.results[$scope.i].chamber == "house")
                                $scope.repIndex = $scope.i;
                        };

                        //figure out senator indexes for alphabetical display of Senators
                        $scope.findSenatorIndexes = 3 - $scope.repIndex;

                        if ($scope.findSenatorIndexes == 3) {
                            // then Senators are in data.results[1] and data.results[2]
                            if (data.results[1].last_name < data.results[2].last_name) {
                                //console.log(data.results[1].last_name + ' < ' + data.results[2].last_name);
                                $scope.senatorAIndex = 1;
                                $scope.senatorBIndex = 2;
                            } else {
                                //console.log(data.results[2].last_name + ' < ' + data.results[1].last_name);
                                $scope.senatorAIndex = 2;
                                $scope.senatorBIndex = 1;
                            }
                        }
                        if ($scope.findSenatorIndexes == 2) {
                            // then Senators are in data.results[0] and data.results[2]
                            if (data.results[0].last_name < data.results[2].last_name) {
                                //console.log(data.results[0].last_name + ' < ' + data.results[2].last_name);
                                $scope.senatorAIndex = 0;
                                $scope.senatorBIndex = 2;
                            } else {
                                //console.log(data.results[2].last_name + ' < ' + data.results[0].last_name);
                                $scope.senatorAIndex = 2;
                                $scope.senatorBIndex = 0;
                            }
                        }
                        if ($scope.findSenatorIndexes == 1) {
                            // then Senators are in data.results[0] and data.results[1]
                            if (data.results[0].last_name < data.results[1].last_name) {
                                //console.log(data.results[0].last_name + ' < ' + data.results[1].last_name);
                                $scope.senatorAIndex = 0;
                                $scope.senatorBIndex = 1;
                            } else {
                                //console.log(data.results[1].last_name + ' < ' + data.results[0].last_name);
                                $scope.senatorAIndex = 1;
                                $scope.senatorBIndex = 0;
                            }
                        }
                    }

                    //show rep names to user
                    $scope.senatorA = data.results[$scope.senatorAIndex].first_name + ' ' + data.results[$scope.senatorAIndex].last_name;
                    $scope.senatorB = data.results[$scope.senatorBIndex].first_name + ' ' + data.results[$scope.senatorBIndex].last_name;
                    $scope.rep = data.results[$scope.repIndex].first_name + ' ' + data.results[$scope.repIndex].last_name;

                    //set reps for user and store all rep IDs
                    $scope.reps = [
                        data.results[$scope.senatorAIndex].bioguide_id,
                        data.results[$scope.senatorBIndex].bioguide_id,
                        data.results[$scope.repIndex].bioguide_id,
                    ];

                }).error(function(data, status) {
                    console.log(data);
                    if (status === 404) {
                        console.log('bad zipcode');
                        alertService.add('zipcode_error', "Sorry, incorrect zipcode.");
                    }
                    // if (status === 400) {
                    //     console.log('bad body format');
                    //     alertService.add('zipcode_error', "Sorry, incorrect zipcode.");
                    // }
                    if (status === 500) {
                        //console.log('WTF MATE?!');
                        alertService.add('server_error', "Sorry, server error.  Please try again.");
                    }
                });


            } else if ($scope.zipcode) {
                // only zipcode given, show senator names to user, recenter map, enable map, wait for button selection...

                // grab zipcode from form
                $scope.zipcode = JSON.stringify($scope.zipcode);

                var sendZipcodeConfig = {
                    method: "GET",
                    url: $rootScope.urlRoot + '/zipcode/' + $scope.zipcode + '/reps',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                //send http request to ID reps using a zipcode
                $http(sendZipcodeConfig).success(function(data) {
                    //console.log(data);


                    // find first senator index
                    for ($scope.i = 0; $scope.i < data.results.length; $scope.i++) {
                        if (data.results[$scope.i].chamber == "senate") {
                            $scope.tempAIndex = $scope.i;
                            break;
                        }
                    };

                    //find second senator index
                    for ($scope.i = $scope.tempAIndex + 1; $scope.i < data.results.length; $scope.i++) {
                        if (data.results[$scope.i].chamber == "senate")
                            $scope.tempBIndex = $scope.i;
                    };

                    // determine which senator is first alphabetically, by last name
                    if (data.results[$scope.tempAIndex].last_name < data.results[$scope.tempBIndex].last_name) {
                        //console.log(data.results[0].last_name + ' < ' + data.results[2].last_name);
                        $scope.senatorAIndex = $scope.tempAIndex;
                        $scope.senatorBIndex = $scope.tempBIndex;
                    } else {
                        //console.log(data.results[2].last_name + ' < ' + data.results[0].last_name);
                        $scope.senatorAIndex = $scope.tempBIndex;
                        $scope.senatorBIndex = $scope.tempAIndex;
                    }

                    //store all rep IDs
                    $scope.reps = [
                        data.results[$scope.senatorAIndex].bioguide_id,
                        data.results[$scope.senatorBIndex].bioguide_id,
                        "???????"
                    ];

                    // display senators
                    $scope.senatorA = data.results[$scope.senatorAIndex].first_name + ' ' + data.results[$scope.senatorAIndex].last_name;
                    $scope.senatorB = data.results[$scope.senatorBIndex].first_name + ' ' + data.results[$scope.senatorBIndex].last_name;

                    // pop senators from data array to display districts for house reps
                    if ($scope.senatorAIndex > $scope.senatorBIndex) {
                        data.results.splice($scope.senatorAIndex, 1);
                        data.results.splice($scope.senatorBIndex, 1);
                    } else {
                        data.results.splice($scope.senatorBIndex, 1);
                        data.results.splice($scope.senatorAIndex, 1);
                    }
                    //console.log(data.results);

                    // pass districts to front end 
                    $scope.districts = data.results.slice();

                    if (data.results.length == 1) {
                        //show text asking user to chose their district based on district map and also show map and buttons
                        $scope.pickDistrict = false;

                        //show map
                        $scope.showMap = false;

                        //show buttons
                        $scope.showDistricts = false;

                        $scope.districtChosen(0);
                    } else {

                        //show text asking user to chose their district based on district map and also show map and buttons
                        $scope.pickDistrict = true;

                        //show map
                        $scope.showMap = true;

                        //show buttons
                        $scope.showDistricts = true;

                        // display senators and districts to help user ID their house rep
                        $scope.rep = "[Click Green District Button Using Map]";

                    }

                }).error(function(data, status) {
                    console.log(data);
                    console.log('status : ' + status);
                });

            }
        }
        }
    ]);
