'use strict';

app.controller('navCtrl', ['$scope', '$http', 'Auth', '$rootScope',
    '$timeout', '$cookieStore',
    function($scope, $http, Auth, $rootScope, $timeout, $cookieStore) {
        // app.controller('loginCtrl', ['$scope', '$http', 'Auth', function (sc, http, auth) {

        //must get token first
        console.log($cookieStore.get('token'));
        $http.defaults.headers.common['x-auth'] = $cookieStore.get('token');

        $scope.isLoggedIn = false;
        $scope.navSelectedIndex = null;

        //$timeout(function() {
            $http.get($rootScope.urlRoot + '/user/bills?per_page=300').success(function(data) {
                $scope.numberOfBillsVotedOn = data.length;
                //console.log('trying to get data length!');
                //console.log(data);
                //console.log(data.length);
            }).error(function(data, status) {
                $scope.numberOfBillsVotedOn = 0;
                console.log(data);
            });
        //}, 200);


        $scope.toggle = function() {
            $scope.isLoggedIn = !$scope.isLoggedIn;
        };

        $scope.logout = function() {
            Auth.logout();
        };

        $scope.navClicked = function(index) {
            $scope.navSelectedIndex = index;
            // turns out $index does not function unless ng-repeat is used
            //console.log(index);
            //console.log('made it');
        };

        $scope.$on('someoneLoggedIn', function() {
            $scope.toggle();
            // console.log("Someone Logged in: " + sc.isLoggedIn);
        });

        $scope.$on('logOut', function() {
            $scope.toggle();
            // console.log("Someone Logged out: " + !sc.isLoggedIn);
        });



    }
]);
