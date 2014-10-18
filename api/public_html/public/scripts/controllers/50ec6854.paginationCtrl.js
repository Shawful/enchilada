'use strict';

app.controller('paginationCtrl', ['$scope', '$http', '$rootScope', '$location', 'Search',
    function($scope, $http, $rootScope, $location, Search) {
        $scope.searchFinished = true;

        $scope.totalItems = 64;
        $scope.currentPage = 1;

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
            console.log(bigCurrentPage);
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
                console.log("last Search from paginationCtrl:" + $rootScope.lastSearch);
            if ($rootScope.lastSearch == "") {
                    // add http request here to make the most recent call but with a page number.
            } else {
                Search.clearBills();
                // bills/search?query="gun control"&per_page=5&page=1
                $http.get($rootScope.urlRoot + '/bills/search/?bill="' + $rootScope.lastSearch + '"&per_page=2&page=' + $scope.currentPage).success(function(data) {
                    console.log('/bills/search?query="' + $rootScope.lastSearch + '"&per_page=5&page=' + $scope.currentPage);                    
                    Search.setBills(data);
                    $rootScope.$broadcast('search');
                    if (data.results.length == 0) {
                        $rootScope.$broadcast('noData');
                    }
                }).error(function(data, status){
                    //console.log('/bills/search?query="' + $rootScope.lastSearch + '"&per_page=5&page=' + $scope.currentPage); 
                    console.log(data);
                    console.log(status);
                });
            }

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
    }
]);
