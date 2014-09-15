'use strict';

app.controller('aboutCtrl', ['$scope', '$http', '$rootScope', '$location', function ($scope, http, $rootScope, $location) {
    
	$scope.sendToLoginPage = function()
    {
        if ($rootScope.user.isLogged != true)
            $location.path('/login');
    };    
    

  }]);