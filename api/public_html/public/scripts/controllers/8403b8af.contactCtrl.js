'use strict';

app.controller('contactCtrl', [
    '$scope', '$http', '$rootScope',
    '$location', 'alertService',
    function($scope, $http, $rootScope, $location, alertService) {

        $scope.disableSend = true;
        $scope.contactUsMessage = "";
        $scope.subject = "";

        $scope.updateContactUsForm = function() {

            if (($scope.contactUsMessage != "") && ($scope.subject != "")) {
                $scope.disableSend = false;
            } else {
                $scope.disableSend = true;
            }
        }

        $scope.sendEmailToAdmin = function() {

            alertService.add('email_sent', "Thanks!  Your email has been sent.");

            var sendEmailContent = {
                method: "POST",
                url: $rootScope.urlRoot + '/contact',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    'subject': $scope.subject,
                    'body': $scope.contactUsMessage
                }
            };

            // send email
            $http(sendEmailContent).success(function(data) {
                console.log("successfully sent email");
                console.log(data);

            }).error(function(data, status) {
                console.log(data);
                console.log(status);
            });
        }
    }
]);
