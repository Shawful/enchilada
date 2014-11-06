'use strict';

/**
 * @ngdoc directive
 * @name politicheckApp.directive:autoFocus
 * @description
 * # autoFocus
 */
angular.module('politicheckApp')
  .directive('autoFocus', function ($timeout) {
    return {
      restrict: 'AC',
      link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
      }
    };
  });
