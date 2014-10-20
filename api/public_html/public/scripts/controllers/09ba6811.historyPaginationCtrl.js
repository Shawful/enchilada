'use strict';

app.controller('historyPaginationCtrl', [
    '$scope', '$http', '$rootScope', '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {
        // set variable defaults
        $scope.hideHistoryPagination = true;

        console.log('made it to historyPaginationCtrl');

        // get bills and bill length immediately
        $http.get($rootScope.urlRoot + '/user/bills').success(function(data) {
            console.log('pagination data');
            $scope.bigTotalItems = data.count;
            console.log(data);
            if ((data.length == null) || (data.length == 0)) {
                $scope.hideHistoryPagination = true;
            } else {
                $scope.hideHistoryPagination = false;
            }
        }).error(function(data, status) {
            console.log(data.length);
            console.log(data);
            console.log(status);
            $scope.hideHistoryPagination = true;
        });

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
