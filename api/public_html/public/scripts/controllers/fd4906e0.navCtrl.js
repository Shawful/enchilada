'use strict';

app.controller('navCtrl', ['$scope', '$http', 'Auth', '$rootScope', function ($scope, http, Auth, $rootScope) {
// app.controller('loginCtrl', ['$scope', '$http', 'Auth', function (sc, http, auth) {
	    
	$scope.isLoggedIn = false;
        
    $scope.toggle = function ()
    {
        $scope.isLoggedIn = ! $scope.isLoggedIn;
    };

    $scope.logout = function()
    {
        Auth.logout();
    };

    $scope.$on('someoneLoggedIn', function()
    {
        $scope.toggle();
        // console.log("Someone Logged in: " + sc.isLoggedIn);
    });

    $scope.$on('logOut', function()
    {
        $scope.toggle();
        // console.log("Someone Logged out: " + !sc.isLoggedIn);
    });
    
    

  }]);