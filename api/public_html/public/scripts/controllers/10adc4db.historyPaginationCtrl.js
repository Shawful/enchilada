'use strict';

app.controller('historyPaginationCtrl', [
    '$scope', '$http', '$rootScope', '$location', 'alertService', '$timeout',
    function($scope, $http, $rootScope, $location, alertService, $timeout) {
        // set variable defaults
        $scope.showHistoryPagination = true;

        //console.log('made it to historyPaginationCtrl');

        // get bills and bill length immediately
        $http.get($rootScope.urlRoot + '/user/bills?&per_page=10').success(function(data) {
            //console.log('pagination data');
            //console.log(data);
            //console.log('length');
            //console.log(data.count);
            $scope.bigTotalItems = data.count;
            if ((data.count == null) || (data.count == 0)) {
                $scope.showHistoryPagination = false;

            } else {
                $scope.showHistoryPagination = true;
                //console.log('made it here');
            }
            //console.log($scope.showHistoryPagination);
        }).error(function(data, status) {
            //console.log(data.length);
            console.log(data);
            console.log(status);
            $scope.showHistoryPagination = false;
        });

        // $timeout(function() {
        //     $scope.showHistoryPagination = true;
        // }, 2000);

        // check showHistoryPagination value for testing
        //console.log('show pagination?');
        //console.log($scope.showHistoryPagination);

        if ($scope.bigTotalItems > 50) {
            $scope.maxSize = 5;
        }

        $scope.pageChanged = function() {
            console.log('page changed');
            console.log($scope.bigCurrentPage);

            // set rootScope variable
            $rootScope.historyPage = $scope.bigCurrentPage;

            // broadcast a history page change
            $rootScope.$broadcast('historyPageChange');

            // $http.get($rootScope.urlRoot + '/user/bills?per_page=10&page=' + $scope.bigCurrentPage).success(function(data) {
            //     console.log('pagination data');
            //     $scope.bigTotalItems = data.count;
            //     console.log(data);
            // }).error(function(data, status) {
            //     console.log(data);
            //     console.log(status);
            // });

        }

    }
]);
