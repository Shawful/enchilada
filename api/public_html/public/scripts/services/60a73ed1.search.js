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
                // console.log(bills);
                return bills;
            },
            setBills: function(data) {
                bills = data.results;
                for (var i =0; i < bills.length;i++){
                    console.log(bills[i].short_title);
                    if (bills[i].short_title == null){
                        //console.log(i);
                        bills[i].short_title = bills[i].official_title.slice(0,45) + " ...";
                        console.log(bills[i].official_title.slice(0,10) + "...");
                    }
                }
            },
            clearBills: function() {
                if (bills) {
                    bills.length = 0;
                }
            }
        };

    }]);
