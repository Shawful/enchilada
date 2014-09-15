'use strict';

angular.module('politicheckApp')
    .directive('votePercentAnimation', '$animate', function($animate) {
        return {
            template: '',
            restrict: 'A',
            // scope: '=',
            link: function percentAnimation(scope, element, attrs) {
                //element.text('this is the votePercentAnimation directive');
                
                scope.$watch(attrs.votePercentAnimation, function(nv,ov){
                	if (nv!=ov){
                		console.log("test");
                	}
                });

                //var percent = rep.repworthiness;
				// console.log("blerg");
	
                // element.click(function() {

                //     console.log("blerg");

                // });

                // $scope.$watch('scope.rep.repworthiness', function() {
                //     console.log("something happened!");
                // });
                // element.on('change', function(){
                // 	console.log('value changed');
                // });
            }
        };
    });
