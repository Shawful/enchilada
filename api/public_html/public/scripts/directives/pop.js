'use strict';

angular.module('politicheckApp')
    .directive('pop', ['$animate',
        function($animate) {
            return {
                template: '',
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    //element.text('this is the pop directive');
                    element.hover(function() {
                            // this function outlines what happens while the element is hovered over
                            element.preventDefault;
                            if (element.hasClass('rubberBand')) {
                                element.removeClass('rubberBand');
                            }
                            if (!element.hasClass('animated')) {
                                element.addClass('animated');
                            }

                            //element.offsetWidth = element.offsetWidth;

                            if (!element.hasClass('pulse')){
                            	$animate.addClass(element, 'pulse');
                            }

                        },
                        function() {
                            // this function outlines what happens when the element is not hovered over
                            if (element.hasClass('pulse')) {
                                element.removeClass('pulse');
                            }
                        });

                }
            };
        }
    ]);
