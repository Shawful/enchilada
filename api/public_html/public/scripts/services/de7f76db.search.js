'use strict';

/**
 * @ngdoc service
 * @name politicheckApp.searchText
 * @description
 * # searchText
 * Service in the politicheckApp.
 */
angular.module('politicheckApp')
  .factory('Search', ['$http', '$rootScope', function searchText($http, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var bills = [];
    
        return {
    	getBills: function() {
    		return bills;
    	},
    	setBills: function(data) {
    		bills = data.results;
       	},
    	clearBills: function() {
    		bills.length = 0;
    	}
    };

  }]);
       