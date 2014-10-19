'use strict';

app.controller('paginationCtrl', ['$scope', '$http', '$rootScope', '$location', 'Search',
    function($scope, $http, $rootScope, $location, Search) {
        $scope.searchFinished = true;
        $scope.totalItems = 64;
        $scope.currentPage = 1;

        $scope.maxSize = 5;
        $scope.bigTotalItems = 50;
        $scope.bigCurrentPage = 1;

        $rootScope.$on('outOfBills', function() {
            //console.log('pagination needs to change to next tab!');
            $scope.setPage($scope.bigCurrentPage + 1);
        });


        $scope.setPage = function(pageNo) {
            //console.log('pageNo' + pageNo);
            $scope.bigCurrentPage = pageNo;
            //console.log('new pageNo: ' + pageNo);
            //console.log(bigCurrentPage);
            $scope.pageChanged();
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.bigCurrentPage);
            console.log("last Search from paginationCtrl:" + $rootScope.lastSearch);
            if ($rootScope.lastSearch == "") {
                // add http request here to make the most recent call but with a page number.
                $http.get($rootScope.urlRoot + '/bills/recent/?per_page=5&page=' + $scope.bigCurrentPage).success(function(data) {
                    //console.log("just got the most recent bills");
                    $scope.bigTotalItems = data.count;
                    $rootScope.numberOfResults = data.count;
                    var shortData = data.results.slice(0, 5);
                    var newData = {
                        results: shortData
                    };
                    $rootScope.lastSearch = "";
                    Search.clearBills();
                    Search.setBills(newData);
                    $rootScope.$broadcast('search');
                }).error(function(data, status) {
                    console.log('got an error trying to get the most recent bills');
                    console.log(data);
                });
            } else {
                console.log($scope.bigTotalItems);
                Search.clearBills();
                // bills/search?query="gun control"&per_page=5&page=1
                $http.get($rootScope.urlRoot + '/bills/search/?bill="' + $rootScope.lastSearch + '"&per_page=5&page=' + $scope.bigCurrentPage).success(function(data) {
                    console.log('/bills/search?query="' + $rootScope.lastSearch + '"&per_page=5&page=' + $scope.bigCurrentPage);
                    console.log('count ' + data.count);
                    $scope.bigTotalItems = data.count;
                    $rootScope.numberOfResults = data.count;
                    Search.setBills(data);
                    $rootScope.$broadcast('search');
                    if (data.results.length == 0) {
                        $rootScope.$broadcast('noData');
                    }
                    console.log('count ' + data.count);
                }).error(function(data, status) {
                    //console.log('/bills/search?query="' + $rootScope.lastSearch + '"&per_page=5&page=' + $scope.currentPage); 
                    console.log(data);
                    console.log(status);
                });
            }



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