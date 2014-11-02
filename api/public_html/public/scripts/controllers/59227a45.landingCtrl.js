'use strict';

app.controller('landingCtrl', ['$scope', '$http', '$rootScope', '$location',
    '$timeout', '$cookieStore', 'alertService', 'Auth',
    function($scope, $http, $rootScope, $location, $timeout, $cookieStore, alertService, Auth) {
        // definie initial variables
        $rootScope.user.username = 'Guest';
        $rootScope.user.password = '';
        $rootScope.user.remember = '';
        $scope.noData = false;
        $scope.IntroOptions = {
            steps: [{
                element: document.querySelector('#step1'),
                intro: "<center>First, we look up all of your congress members for you.</center>",
                position: 'right'
            }, {
                element: document.querySelector('#step2'),
                intro: "<center>Next, just vote on bills that affect or interest you.</center>",
                position: 'right'
            }, {
                element: document.querySelector('#step3'),
                intro: "<center>And then we calculate a repworthiness percentage.<br><br>The percentage <em>increases</em> if you agree with your representative, but it <div class='error'>decreases</div> if the represenative <em>disagrees or abstained from voting</em>.</center>",
                position: 'right'
            }, {
                element: document.querySelector('#step4'),
                intro: "<center>You can even pick topics that are interesting to you.</center>",
                position: 'left'
            }, {
                element: document.querySelector('#step5'),
                intro: "<center>Or you can search for bills by topic, name 'obamacare', or id 'hr5109'</center>"
            }, {
                element: document.querySelector('#step6'),
                intro: "<center>And now voters can easily answer the question of whether or not to reelect or replace their congressman. <br><br> <strong>You can bet EasyBallot.org is going to change elections </strong> <br><br> Register to get started and share us on Facebook!<br><span fb-like></span></center>"
            }],
            showStepNumbers: false,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            exitOnEsc: true,
            nextLabel: '<strong>NEXT</strong>',
            prevLabel: '<span style="color:green">Previous</span>',
            skipLabel: 'Exit Tour',
            doneLabel: 'Exit Tour',
            overlayOpacity: '0.7'
        };
        $scope.showInitialLanding = true;
        //$scope.reps = [];


        // set up carousel
        $(document).ready(function() {
            //Set the carousel options
            $('#quote-carousel').carousel({
                pause: true,
                interval: 4000,
            });
        });

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
            //console.log("Before Change Event called");
            //console.log(targetElement);
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

        $scope.CompletedEvent = function() {
            console.log("Completed Event called");
            $scope.showInitialLanding = true;
            $scope.showStep1 = false;
        };

        $scope.ExitEvent = function() {
            console.log("Exit Event called");
            $scope.showInitialLanding = true;
            $scope.showStep1 = false;
        };

        $scope.guestLogin = function() {
            console.log('guest login');

            Auth.guestLogin();

            // var user = $rootScope.user;
            // var loginConfig = {
            //     method: "POST",
            //     url: $rootScope.urlRoot + '/user/guest',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         "x-username": user.username,
            //         "x-password": user.password,
            //         "x-rememberme": user.remember
            //     }
            // };

            // $http(loginConfig).success(function(data) {
            //     console.log("Logged in!");
            //     var $authToken = data.token; // this is the line that grabs the token value from the returned AJAX json call!
            //     //$Username = data.user.username;

            //     // set values for user and authtoken in rootscope and http defaults (for future calls)
            //     $http.defaults.headers.common['x-auth'] = $authToken;

            //     //update cookies
            //     $cookieStore.put('user', $rootScope.user);
            //     $cookieStore.put('token', $authToken);

            //     // use the alert service to notify that a user is logged in
            //     alertService.add("login", "Welcome, " + $rootScope.user.username + "!");

            //     $rootScope.user = {
            //         'username': user.username,
            //         isLogged: true,
            //         role: userRoles.user,
            //         'authtoken': $authToken
            //     };
            //     //console.log($rootScope.user);

            //     //console.log ('token :' + $rootScope.user.authtoken);
            //     $rootScope.user = user;
            //     $rootScope.user.isLogged = true;
            //     $rootScope.user.role = $rootScope.userRoles.user;
            //     $rootScope.$broadcast('someoneLoggedIn');
            //     $location.path('/home');

            // }).error(function(data, status) {
            //     if (status === 404) {
            //         console.log('bad login combo');
            //         alertService.add('login_error', "Sorry buddy, guest services are down currently.  We're working to fix this!");
            //     }
            //     console.log(data);
            //     console.log(status);
            // });

        };
    }
]);
