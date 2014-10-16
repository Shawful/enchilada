'use strict';

/**
 * @ngdoc function
 * @name politicheckApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the politicheckApp
 */
angular.module('politicheckApp')
    .controller('searchCtrl', ['$rootScope', '$scope', '$http', 'Search',
        function($rootScope, $scope, $http, Search) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];


            $scope.enterPressed = function($event) {
                $scope.search($scope.searchText);
                $event.preventDefault();
            };

            $scope.search = function(searchText) {
                //console.log("You searched for: " + searchText);
                Search.clearBills();
                $scope.$broadcast('clearSearch');

                //$rootScope.noData = false;
                //console.log("cleared bills array");
                $http.get($rootScope.urlRoot + '/bills/search/?bill="' + searchText + '"&per_page=5').success(function(data) {
                    //$rootScope.$broadcast('newSearch');
                    //console.log(data);
                    $rootScope.$broadcast('search');
                    Search.setBills(data);
                    if (data.results.length == 0) {
                        $rootScope.$broadcast('noData');
                        //console.log('nothing in data [from search controller]');
                    }
                    //console.log(data);
                });

                $scope.newText = function() {
                    //console.log('made it to newText function');
                    $rootScope.$broadcast('newSearch');
                    console.log('problem is here');
                    
                    //$scope.$apply;
                    //console.log(searchText); // for some reason, nothing is retained until enter is pressed
                }
                //console.log(Search.getBills(searchText));
                // As it turns out, you can't pass data between controllers unless you use a service.
                // I can create a search service that is injected into the searchCtrl and the billCtrl.
                // Then I can say that the $scope.bills = searchService.getbills(); 
                // However, for the time being, I'm going to just use the same controller between the bills section
                // and the search bar.  Then I can define the search call to update the bills object, since they share the same
                // controller, and I won't have to even bother with a service!  (for now)
                //console.log($scope.bill[0]);
                //$scope.bills.splice(0,5);
                //$scope.bills.splice(0,5,data);

                //$scope.bills.push(data); // response data // this didn't work
                //console.log(searchText);
                //console.log(data[0]);  // successful call to log top five bills associated with searchText
            };
        }
    ]);
