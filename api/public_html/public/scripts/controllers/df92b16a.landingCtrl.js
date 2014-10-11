'use strict';

app.controller('landingCtrl', ['$scope', '$http', '$rootScope', '$location', function ($scope, http, $rootScope, $location) {
    $scope.noData = false;

    $scope.sendToLoginPage = function()
    {
        if ($rootScope.user.isLogged != true)
            $location.path('/login');
    };    
    
    $scope.$on('clearSearch', function()
    {
    	//console.log(searchText);
    	$scope.noData = false;
    	console.log('made it to landing contorller');
    });

    $scope.$on('noData', function()
    {
    	console.log('made it to the landing controller');
        $scope.noData = true;
        console.log($scope.noData);
        // console.log("Someone Logged in: " + sc.isLoggedIn);
    });

  }]);