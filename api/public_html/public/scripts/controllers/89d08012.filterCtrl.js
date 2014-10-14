'use strict';

angular.module('politicheckApp')
    .controller('filterCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            $scope.tests = {
                "Most Recent": true,
                "Women's Issues": true,
                "Taxes": false,
                "LGBT": true
            };
            $scope.filters = [{

                    "name": "Most Recent"
                }, {
                    "name": "Women's Issues"
                }, {
                    "name": "Taxes"
                }, {
                    "name": "LGBT"
                }];

    }]);
