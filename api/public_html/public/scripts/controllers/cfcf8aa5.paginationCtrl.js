'use strict';

app.controller('paginationCtrl', ['$scope', '$http', '$rootScope', '$location',
    function($scope, http, $rootScope, $location) {
        $scope.searchFinished = true;

        $scope.totalItems = 64;
        $scope.currentPage = 1;

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
            console.log(bigCurrentPage);
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
            if ($rootScope.lastSearch == "") {

            }
            else{
                
            }
        };

        $scope.maxSize = 5;
        $scope.bigTotalItems = 175;
        $scope.bigCurrentPage = 1;


        $rootScope.$on('noData', function() {
            $scope.searchFinished = false;
            console.log('hide bar, no data');
        });
        $rootScope.$on('search', function() {
            $scope.searchFinished = true;
        });

    }
]);
