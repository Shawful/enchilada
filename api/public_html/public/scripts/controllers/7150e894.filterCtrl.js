'use strict';

angular.module('politicheckApp')
    .controller('filterCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            
            $scope.filters = [{
                "name": "Most Recent",
                "show": true,
                "query": "mostRecent",
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

            // $scope.filterSearch = function(query){
            // 	console.log('made it to filterSearch function');
            // 	console.log(query);
            // };
        }
    ]);
