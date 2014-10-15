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

            $scope.filterSearch = function(query, i){
            	//console.log('made it to filterSearch function');
            	//console.log(query);
            	$scope.selectedIndex = i;

            	// add code to check if query == "mostRecent"
            	// if so, send http request
            	// otherwise, set query and $rootScope.$broadcast(search);
            };
        }
    ]);
