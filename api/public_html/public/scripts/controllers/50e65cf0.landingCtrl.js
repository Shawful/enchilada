'use strict';

app.controller('landingCtrl', ['$scope', '$http', '$rootScope', '$location', function (sc, http, $rootScope, $location) {
    
	sc.sendToLoginPage = function()
    {
        if ($rootScope.user.isLogged != true)
            $location.path('/login');
    };    
    

  }]);