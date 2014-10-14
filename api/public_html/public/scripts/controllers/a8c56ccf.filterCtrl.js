'use strict';

angular.module('politicheckApp')
    .controller('filterCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            $scope.selectedIndex = 0;
            $scope.filters = [{
                "name": "Most Recent",
                "show": true,
                "query": "mostRecent"
            }, {
                "name": "Women's Issues",
                "show": true,
                "query": "Abortion"
            }, {
                "name": "Taxes",
                "show": true,
                "query": "taxes"
            }, {
                "name": "LGBT",
                "show": false,
                "query": "gay"
            }];

            // add http request to replace $scope.filters array

            $scope.filterSearch = function(query, i) {
                //console.log('made it to filterSearch function');
                //console.log(query);
                $scope.selectedIndex = i;

                // add code to check if query == "mostRecent"
                if (query == "mostRecent") {
                    $http.get($rootScope.urlRoot + '/bills/recent').success(function(data) {
                        console.log("just got the most recent bills");
                        var shortData = data.results.slice(0, 5);
                        var newData = {
                            results: shortData
                        };
                        //console.log("new Data");
                        //console.log(newData);
                        Search.clearBills();
                        //$timeout(Search.setBills(newData), 0);
                        Search.setBills(newData);
                        //$timeout($rootScope.$broadcast('search'), 2000);
                        $rootScope.$broadcast('search');
                        //console.log(data);
                        //console.log(shortData);
                    }).error(function(data, status) {
                        console.log('got an error trying to get the most recent bills');
                        console.log(data);
                    });
                    // if so, send http request
                    // otherwise, set query and $rootScope.$broadcast(search);
                } else {
                    //console.log('made it to a normal filter');
                    //console.log(query);
                    Search.clearBills();
                    $http.get($rootScope.urlRoot + '/bills/search/?bill="' + query + '"&per_page=5').success(function(data) {

                        //console.log('bill search successful');
                        Search.setBills(data);
                        $rootScope.$broadcast('search');

                    });

                }
            }
        }
    ]);
