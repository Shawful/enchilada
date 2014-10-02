'use strict';

/**
 * @ngdoc function
 * @name politicheckApp.controller:RegctrlCtrl
 * @description
 * # RegctrlCtrl
 * Controller of the politicheckApp
 */
app.controller('regCtrl', ['$scope', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.validateContact = function () {
    	//console.log("validating contact info");
    	//console.log("email info:");
    	//console.log(registration.email);

    };
//console.log("controller works");

  }]);
