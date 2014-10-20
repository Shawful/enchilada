'use strict';

app.controller('historyPaginationCtrl', [
    '$scope', '$http', '$rootScope', '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {
        // get rep names immediately
        $http.get($rootScope.urlRoot + '/user/bills').success(function(data) {
            console.log('pagination data');
            $scope.bigTotalItems = data.count;
            console.log(data);
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

        if ($scope.bigTotalItems > 50) {
            $scope.maxSize = 5;
        }

        $scope.pageChanged = function() {
            console.log('page changed');
            console.log($scope.bigCurrentPage);
            $http.get($rootScope.urlRoot + '/user/bills?per_page=10&page=' + $scope.bigCurrentPage).success(function(data) {
                console.log('pagination data');
                $scope.bigTotalItems = data.count;
                console.log(data);
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });

        }

    }
]);
