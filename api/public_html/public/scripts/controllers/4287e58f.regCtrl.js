'use strict';

/**
 * @ngdoc function
 * @name politicheckApp.controller:RegctrlCtrl
 * @description
 * # RegctrlCtrl
 * Controller of the politicheckApp
 */
app.controller('regCtrl', ['$scope', '$http', '$rootScope', '$location', 'alertService', 'Auth',
    function($scope, $http, $rootScope, $location, alertService, Auth) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $rootScope.reps = [];
        $scope.finishedWizard = function() {
            $scope.filters = [{
                "name": "Most Recent",
                "show": true,
                "query": "mostRecent"
            }, {
                "name": "Veterans",
                "show": $scope.$$childTail.veterans,
                "query": "veterans"
            }, {
                "name": "Defense Spending",
                "show": $scope.$$childTail.defenseSpending,
                "query": "defense spending"
            }, {
                "name": "Disaster Relief",
                "show": $scope.$$childTail.disasterRelief,
                "query": "disaster relief"
            }, {
                "name": "Religion",
                "show": $scope.$$childTail.religion,
                "query": "religion"
            }, {
                "name": "Women's Rights",
                "show": $scope.$$childTail.abortion,
                "query": "abortion"
            }, {
                "name": "LGBT",
                "show": $scope.$$childTail.lgbt,
                "query": "lgbt"
            }, {
                "name": "Health Care",
                "show": $scope.$$childTail.healthCare,
                "query": "health care"
            }, {
                "name": "Children",
                "show": $scope.$$childTail.children,
                "query": "children"
            }, {
                "name": "Education",
                "show": $scope.$$childTail.education,
                "query": "education"
            }, {
                "name": "Taxes",
                "show": $scope.$$childTail.taxes,
                "query": "taxes"
            }, {
                "name": "Minorities",
                "show": $scope.$$childTail.minority,
                "query": "minority"
            }, {
                "name": "Privacy",
                "show": $scope.$$childTail.privacy,
                "query": "privacy"
            }];

            var registerUserConfig = {
                method: "POST",
                url: $rootScope.urlRoot + '/user',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "_id": $scope.$$childTail.email,
                    "password": $scope.$$childTail.passwordA,
                    "age": $scope.$$childTail.age,
                    "senators": [{
                        "id": $scope.$$childTail.reps[0],
                        "disagree": 0
                    }, {
                        "id": $scope.$$childTail.reps[1],
                        "disagree": 0
                    }, {
                        "id": $scope.$$childTail.reps[2],
                        "disagree": 0
                    }],
                    "firstName": $scope.$$childTail.firstName,
                    "lastName": $scope.$$childTail.lastName,
                    "sex": $scope.$$childTail.sex,
                    "tos": $scope.$$childTail.tos,
                    "share": $scope.$$childTail.share,
                    "address": $scope.$$childTail.address,
                    "zipcode": $scope.$$childTail.zipcode,
                    "state": $scope.$$childTail.state,
                    "district": $scope.$$childTail.district,
                    "interest": $scope.filters
                        // {
                        //     "veterans": $scope.$$childTail.interest.veterans,
                        //     "defenseSpending": $scope.$$childTail.interest.defenseSpending,
                        //     "disasterRelief": $scope.$$childTail.interest.disasterRelief,
                        //     "religion": $scope.$$childTail.interest.religion,
                        //     "abortion": $scope.$$childTail.interest.abortion,
                        //     "lgbt": $scope.$$childTail.interest.lgbt,
                        //     "healthCare": $scope.$$childTail.interest.healthCare,
                        //     "children": $scope.$$childTail.interest.children,
                        //     "education": $scope.$$childTail.interest.education,
                        //     "taxes": $scope.$$childTail.interest.taxes,
                        //     "minority": $scope.$$childTail.interest.minority,
                        //     "privacy": $scope.$$childTail.interest.privacy
                        // }
                }
            };

            //console.log(registerUserConfig.data);
            console.log(registerUserConfig.data);
            // add http call to send registration data HERE
            $http(registerUserConfig).success(function(data) {
                alertService.add('registered', "Successfully registered.");
                //console.log('made it!');

                // programmatically close modal window
                //$('#registrationModalContainer').modal({show: false});   <--- Didn't work

                // redirect to login
                //$location.path('/login');

                // update $rootScope user data
                $rootScope.user.username = $scope.$$childTail.email;
                $rootScope.user.password = $scope.$$childTail.passwordA;
                $rootScope.user.remember = true;

                // login programmatically
                Auth.login($rootScope.user, function() {}, function() {});

                // clear data
                registerUserConfig = {};

            }).error(function(data, status) {
                if (status == 400) {
                    alertService.add('already_registered', "Sorry, that user is already registered.");
                    //console.log('didn\'t make it!');

                }
            });
        }

        $scope.updateGeneralInfo = function() {

            $scope.validStepOne = false;

            $scope.validFirstName = false;
            $scope.validLastName = true;
            $scope.validEmail = false;
            $scope.validPasswordA = false;
            $scope.validPasswordB = false;
            $scope.validPasswordMatch = false;
            $scope.validAge = false;
            $scope.validSex = false;
            $scope.validTOS = false;


            if ($scope.$$childTail.firstName) {
                $scope.validFirstName = true;
            }
            if ($scope.$$childTail.lastName) {
                $scope.validLastName = true;
            }
            if ($scope.$$childTail.email) {
                $scope.validEmail = true;
            }
            if ($scope.$$childTail.passwordA) {
                $scope.validPasswordA = true;
            }
            if ($scope.$$childTail.passwordB) {
                $scope.validPasswordB = true;
            }
            if ($scope.$$childTail.passwordA == $scope.$$childTail.passwordB) {
                $scope.validPasswordMatch = true;
                $scope.$$childTail.validPasswordMatch = true;
            } else {
                $scope.validPasswordMatch = false;
                $scope.$$childTail.validPasswordMatch = false;
            }
            if ($scope.$$childTail.age) {
                $scope.validAge = true;
            }
            if ($scope.$$childTail.sex) {
                $scope.validSex = true;
            }
            if ($scope.$$childTail.tos) {
                $scope.validTOS = true;
            }
            //console.log($scope.$$childTail.firstName.$error);
            //console.log($error);
            //console.log(firstname.$error);
            //console.log($scope.firstName.$error);
            //console.log($scope.$$childTail.$$childTail.registration.email.$valid);
            //console.log($scope);
            $scope.$$childTail.validStepOne = $scope.validFirstName && $scope.validLastName && $scope.validEmail && $scope.validPasswordA && $scope.validPasswordB && $scope.validAge && $scope.validSex && $scope.validTOS && $scope.validPasswordMatch;
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
        }

        $scope.districtChosen = function($index) {
            // determine which button was pressed to select a district (and house rep)
            //console.log('made it!');
            //console.log($index);

            // send rep's bioguide id to $rootScope as well as the rep's first and last name 
            // $rootScope.rep[2].firstName = $scope.$$childTail.districts[$index].first_name;
            // $rootScope.rep[2].lastName = $scope.$$childTail.districts[$index].last_name;
            // $rootScope.rep[2].bioguide_id = $scope.$$childTail.districts[$index].bioguide_id;

            // set district selection info for final registration http request
            $scope.$$childTail.state = $scope.$$childTail.districts[$index].state;
            $scope.$$childTail.district = $scope.$$childTail.districts[$index].district;

            // update house rep display for user
            $scope.$$childTail.rep = $scope.$$childTail.districts[$index].first_name + ' ' + $scope.$$childTail.districts[$index].last_name;

            // add chosen house rep's ID to rep ID array
            $scope.$$childTail.reps[2] = $scope.$$childTail.districts[$index].bioguide_id;
            //console.log($scope.$$childTail.reps);

            // enable NEXT button
            $scope.validStepThree = true;
        };


        $scope.findReps = function() {
            // console.log('made it');
            // console.log($scope.$$childTail.address);
            // console.log($scope.$$childTail.zipcode);
            // console.log($scope);
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
            if ($scope.$$childTail.address) {

                //grab data from form and replace ' ' with '+' in address
                $scope.address = $scope.$$childTail.address.replace(/ /g, '+');
                $scope.zipcode = $scope.$$childTail.zipcode;

                //add zipcode and address in body of http request
                sendAddressConfig.data = {
                    'streetAddress': $scope.address,
                    'zipcode': $scope.zipcode
                };

                //console.log($scope.address);
                //console.log($scope.zipcode);
                //console.log(sendAddressConfig);


                // send http request with address to get rep names and bioguide_ids
                $http(sendAddressConfig).success(function(data) {

                    //console.log(data);

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
                    $scope.$$childTail.senatorA = data.results[$scope.senatorAIndex].first_name + ' ' + data.results[$scope.senatorAIndex].last_name;
                    $scope.$$childTail.senatorB = data.results[$scope.senatorBIndex].first_name + ' ' + data.results[$scope.senatorBIndex].last_name;
                    $scope.$$childTail.rep = data.results[$scope.repIndex].first_name + ' ' + data.results[$scope.repIndex].last_name;

                    //store all rep IDs
                    $scope.$$childTail.reps = [
                        data.results[$scope.senatorAIndex].bioguide_id,
                        data.results[$scope.senatorBIndex].bioguide_id,
                        data.results[$scope.repIndex].bioguide_id,
                    ];

                    //console.log($scope.$$childTail.reps);
                    //console.log(data.results[$scope.senatorAIndex].bioguide_id);
                    //console.log(data.results[$scope.senatorBIndex].bioguide_id);
                    //console.log(data.results[$scope.repIndex].bioguide_id);

                    //set reps for user


                    //enable the "Next" button
                    $scope.$$childTail.validStepThree = true;

                    //console.log("address entered");
                    //console.log(data);
                    // var $authToken = data.token;
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


            } else if ($scope.$$childTail.zipcode) {
                // only zipcode given, show senator names to user, recenter map, enable map, wait for button selection...

                // grab zipcode from form
                $scope.zipcode = JSON.stringify($scope.$$childTail.zipcode);

                var sendZipcodeConfig = {
                    method: "GET",
                    url: $rootScope.urlRoot + '/zipcode/' + $scope.zipcode + '/reps',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                //console.log("zipcode entered");
                //console.log($scope.zipcode);


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
                    //console.log('A ' + $scope.tempAIndex);
                    //console.log('B ' + $scope.tempBIndex);

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
                    $scope.$$childTail.reps = [
                        data.results[$scope.senatorAIndex].bioguide_id,
                        data.results[$scope.senatorBIndex].bioguide_id,
                        "???????"
                        //data.results[$scope.senatorBIndex].bioguide_id
                    ];
                    //console.log($scope.$$childTail.reps);

                    // store senator names in $rootScope
                    // $rootScope.reps[0].firstName = data.results[$scope.senatorAIndex].first_name;
                    // $rootScope.reps[0].lastName = data.results[$scope.senatorAIndex].last_name;
                    // $rootScope.reps[0].bioguide_id = $scope.$$childTail.reps[0];
                    // $rootScope.reps[1].firstName = data.results[$scope.senatorBIndex].first_name;
                    // $rootScope.reps[1].lastName = data.results[$scope.senatorBIndex].last_name;
                    // $rootScope.reps[1].bioguide_id = $scope.$$childTail.reps[1];

                    // display senators
                    $scope.$$childTail.senatorA = data.results[$scope.senatorAIndex].first_name + ' ' + data.results[$scope.senatorAIndex].last_name;
                    $scope.$$childTail.senatorB = data.results[$scope.senatorBIndex].first_name + ' ' + data.results[$scope.senatorBIndex].last_name;

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
                    $scope.$$childTail.districts = data.results.slice();

                    if (data.results.length == 1) {
                        //show text asking user to chose their district based on district map and also show map and buttons
                        $scope.$$childTail.pickDistrict = false;

                        //show map
                        $scope.$$childTail.showMap = false;

                        //show buttons
                        $scope.$$childTail.showDistricts = false;

                        $scope.districtChosen(0);
                    } else {

                        //show text asking user to chose their district based on district map and also show map and buttons
                        $scope.$$childTail.pickDistrict = true;

                        //show map
                        $scope.$$childTail.showMap = true;

                        //show buttons
                        $scope.$$childTail.showDistricts = true;

                        // display senators and districts to help user ID their house rep
                        $scope.$$childTail.rep = "[Click Green District Button Using Map]";

                    }

                }).error(function(data, status) {
                    console.log(data);
                    console.log('status : ' + status);
                });

            }
        }
    }
]);
