'use strict';

angular.module('politicheckApp')
  .controller('verifyCtrl', ['scope', '$http', function ($scope, $http) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.error = false;

    $http.post()
  }]);
