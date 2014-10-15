'use strict';

app.controller('contactCtrl', ['$scope', '$http', '$rootScope', '$location', 'alertService', function($scope, http, $rootScope, $location, alertService) {

    $scope.sendEmailToAdmin = function(username) {
        // if ($rootScope.user.isLogged != true)
        //     $location.path('/login');
    alertService.add('email_sent', "Thanks!  Your email has been sent.");
    console.log(username);
    };


}]);
