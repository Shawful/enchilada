'use strict';

app.controller('landingCtrl', ['$scope', '$http', '$rootScope', '$location',
    '$timeout',
    function($scope, $http, $rootScope, $location, $timeout) {
        // definie initial variables
        $scope.noData = false;
        $scope.IntroOptions = {
            steps: [{
                element: document.querySelector('#step1'),
                intro: "<center>We look up all of your congress members for you.</center>",
                dataPosition: 'right'
            },
            {
                element: document.querySelector('#step2'),
                intro: "<center>You vote on bills that affect you personally.</center>",
                dataPosition: 'right'
            },
            {
                element: document.querySelector('#step3'),
                intro: "<center>And we calculate a repworthiness percentage.<br><br>The percentage <em>increases</em> if you agree with your representative, and it <div class='error'>decreases</div> if the represenative <em>disagrees or abstained from voting</em>.</center>"
            },
            {
                element: document.querySelector('#step4'),
                intro: "<center>You can even pick topics that are interesting to you.</center>"
            },
            {
                element: document.querySelector('#step5'),
                intro: "<center>Or you can search for bills by name 'obamacare' or id 'hr5109'</center>"
            },
            {
                element: document.querySelector('#step6'),
                intro: "<center>And now voters can easily answer the question of whether or not to reelect or replace their congressman. <br><br> <strong>You can bet EasyBallot.org is going to change elections </strong> <br><br>  Share us on facebook and spread the word!<br><span fb-like></span></center>"
            }
            ],
            showStepNumbers: false,
            showBullets: false,
            exitOnOverlayClick: true,
            exitOnEsc: true,
            nextLabel: '<strong>NEXT</strong>',
            prevLabel: '<span style="color:green">Previous</span>',
            skipLabel: 'Exit',
            doneLabel: 'Exit Tour'
        };
        $scope.showInitialLanding = true;
        //$scope.reps = [];

        //fill reps with json data
        $http.get('json/reps.json').success(function(data) {
            $scope.reps = data; // response data 
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

        // fill bills with json data
        $http.get('json/bills.json').success(function(data) {
            $scope.bills = data; // response data 
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

        $scope.sendToLoginPage = function() {
            if ($rootScope.user.isLogged != true)
                $location.path('/login');
        };


        $scope.$on('newSearch', function() {
            //console.log(searchText);
            $scope.noData = false;
            //console.log('AHHH! cleared out error message');
            //console.log(searchText);

            console.log('test');
        });

        $scope.$on('search', function() {
            //console.log(searchText);
            $scope.noData = false;
            console.log('cleared out error message');
        });

        $scope.$on('noData', function() {
            console.log('made it to the landing controller');
            $scope.noData = true;
            console.log($scope.noData);
            // console.log("Someone Logged in: " + sc.isLoggedIn);
        });

        $scope.BeforeChangeEvent = function(targetElement) {
            console.log("Before Change Event called");
            console.log(targetElement);
        };

        $scope.startTour = function() {
            console.log("started tour");
            $scope.showInitialLanding = false;
            $scope.showStep1 = true;
            $timeout(function() {
                $scope.CallMe();
            }, 800);
            //$timeout(function() {$scope.CallMe();},40);
        };
    }
]);
