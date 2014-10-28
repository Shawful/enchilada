'use strict';

app.controller('landingCtrl', ['$scope', '$http', '$rootScope', '$location',
    '$timeout',
    function($scope, http, $rootScope, $location, $timeout) {
        // definie initial variables
        $scope.noData = false;
        $scope.IntroOptions = {
            steps: [{
                element: document.querySelector('#step1'),
                intro: "This is the first tooltip."
            }],
            showStepNumbers: false,
            showBullets: false,
            exitOnOverlayClick: true,
            exitOnEsc: true,
            nextLabel: '<strong>NEXT!</strong>',
            prevLabel: '<span style="color:green">Previous</span>',
            skipLabel: 'Exit',
            doneLabel: 'Thanks'
        };
        $scope.showInitialLanding = true;

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
            $scope.testShow = true;
            $timeout(function() {$scope.CallMe();},100);
            //$timeout(function() {$scope.CallMe();},40);
        };
    }
]);
