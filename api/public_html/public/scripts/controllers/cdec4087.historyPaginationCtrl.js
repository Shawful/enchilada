'use strict';

app.controller('historyPaginationCtrl', [
    '$scope', '$http', '$rootScope',
    '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {
        // get rep names immediately
        $http.get($rootScope.urlRoot + '/user/reps').success(function(data) {
            console.log(data);
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

    }
]);
