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
    //console.log(bills);
    return {
    	getBills: function() {
    		//console.log("GETBILL service's version of bills : ");
    		//console.log(bills);
    		return bills;
    	},
    	setBills: function(data) {
    		//console.log(data);
    		//bills.push(data);//
    		bills = data;
    		//console.log(bills);
    	},
    	clearBills: function() {
    		bills.length = 0;
    	}
    };

  }]);
        
        // create a function that will return the five bills given a certain text string
    
   //  	initialize: function(){

   //  		return returnData;
   //  	},
   //  	getBills: function(searchText) {
   //  		console.log("get bills was called");
   //  		console.log("searchText: " + searchText);
			// $http.get($rootScope.urlRoot + '/bills/search/?bill="' + searchText + '"&per_page=5').success(function(data) {
			// 	returnData = data;
			// 	console.log("short title from data: " + data[1].short_title);
   //            // bills.push(data); // response data 
   //            // console.log("short title from bills" + bills[0].short_title);
   //          });
   //          return returnData;
   //  	},

   //  	clearBills: function() {
   //  		data.length = 0;
   //  		return returnData;
   //  	}

    //}




    // creat a function that will clear out the bills object

    // I could have a function call in the service which returns a set of bills given a search string..

    // is that all that I would need?

    // I mean, the bills controller needs a set of bills when the home page is hit...
    // and we needs to get new bills if someone hits the search button...

    // we could first use a function to clear out the bills...

    // and we could have a function to THEN return the new bills from a search ...

    // that way all that the search controller has to do is call the searchText.clearPrevBills and searchText.getResults methods
    
