'use strict';

angular.module('politicheckApp')
    .controller('filterCtrl', ['$rootScope', '$scope', '$http', 'alertService', '$filter', '$timeout', 'Search',
        function($rootScope, $scope, $http, alertService, $filter, $timeout, Search) {
            var filters = {
                "Most Recent": true,
                "Women's Issues": true,
                "Taxes": false,
                "LGBT": true
            };
        }
    ]);
