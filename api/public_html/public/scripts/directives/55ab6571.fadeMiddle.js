'use strict';

angular.module('politicheckApp')
    .directive('fadeMiddle', ['$animate',
        function($animate) {
            return {
                template: '',
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    //element.text('this is the pop directive');
                    element.hover(function() {
                            // this function outlines what happens while the element is hovered over
                            element.preventDefault;
                            if (element.$middle) {
                                element.removeClass('fadeLast');
                                element.addClass('fadeMiddle');
                            }
                            if (!element.hasClass('animated')) {
                                element.addClass('animated');
                            }

                            //element.offsetWidth = element.offsetWidth;

                            if (!element.hasClass('fadeMiddle')){
                            	$animate.addClass(element, 'fadeMiddle');
                            }
                            $compile(element)(scope);

                        },
                        function() {
                            // this function outlines what happens when the element is not hovered over
                            // if (element.hasClass('pulse')) {
                            //     element.removeClass('pulse');
                            // }
                        });

                }
            };
        }
    ]);
