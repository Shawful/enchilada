'use strict';

angular.module('politicheckApp')
    .factory('alertService', ['$rootScope', '$timeout',
    function alertService($rootScope, $timeout) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var alertService = {};

        //create an array of alerts available globally
        $rootScope.alerts = [
        //'login', "Welcome back, ' + '$rootScope.user.username",
        // 'logout', "$rootScope.user.username + ' logged out'"
        ];

        alertService.add = function(type, msg) {
            $rootScope.alerts.push({
                'type': type,
                'msg': msg
            });

            $timeout(function() {
                $rootScope.alerts.splice(0, 1);
            }, 2000);
    };

    alertService.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };

    return alertService;

}]);
