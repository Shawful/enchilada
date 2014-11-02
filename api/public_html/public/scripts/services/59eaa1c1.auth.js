'use strict';


angular.module('politicheckApp')
    .factory('Auth', ['$http', '$rootScope', '$cookieStore', '$location', 'alertService',
        function Auth($http, $rootScope, $cookieStore, $location, alertService) {

            return {

                authorize: function(accessLevel, role) {
                    if (role === undefined)
                        role = $rootScope.user.role;
                    return accessLevel & role;
                },

                logMeIn: function() {
                    alert("working");
                },

                isLoggedIn: function(user) {
                    if (user === undefined)
                        user = $rootScope.user;
                    return user.role === userRoles.user || user.role === userRoles.admin;
                },

                register: function(user, success, error) {
                    // $http.post('/register', user).success(success).error(error);
                },

                login: function(user, success, error) {

                    $rootScope.user = user;
                    var loginConfig = {
                        method: "POST",
                        url: $rootScope.urlRoot + '/user/login',
                        headers: {
                            'Content-Type': 'application/json',
                            "x-username": user.username,
                            "x-password": user.password,
                            "x-rememberme": user.remember
                        }
                    };

                    $http(loginConfig).success(function(data) {
                        console.log("Logged in!");
                        var $authToken = data.token; // this is the line that grabs the token value from the returned AJAX json call!
                        //$Username = data.user.username;

                        // set values for user and authtoken in rootscope and http defaults (for future calls)
                        $http.defaults.headers.common['x-auth'] = $authToken;

                        //update cookies
                        $cookieStore.put('user', $rootScope.user);
                        $cookieStore.put('token', $authToken);

                        // use the alert service to notify that a user is logged in
                        alertService.add("login", "Welcome, " + $rootScope.user.username + "!");

                        $rootScope.user = {
                            'username': user.username,
                            isLogged: true,
                            role: userRoles.user,
                            'authtoken': $authToken
                        };
                        //console.log($rootScope.user);

                        //console.log ('token :' + $rootScope.user.authtoken);
                        $rootScope.user = user;
                        $rootScope.user.isLogged = true;
                        $rootScope.user.role = $rootScope.userRoles.user;
                        $rootScope.$broadcast('someoneLoggedIn');
                        $location.path('/home');

                    }).error(function(data, status) {
                        if (status === 404) {
                            console.log('bad login combo');
                            alertService.add('login_error', "Sorry, incorrect user name or password combination. If the account has not yet been verified, please check your email.");
                        }
                    });

                },

                guestLogin: function() {
                    console.log('guest login');

                    var user = $rootScope.user;
                    var loginConfig = {
                        method: "POST",
                        url: $rootScope.urlRoot + '/user/guest',
                        headers: {
                            'Content-Type': 'application/json',
                            "x-username": user.username,
                            "x-password": user.password,
                            "x-rememberme": user.remember
                        }
                    };

                    $http(loginConfig).success(function(data) {
                        console.log("Logged in!");
                        var $authToken = data.token; // this is the line that grabs the token value from the returned AJAX json call!
                        //$Username = data.user.username;

                        // set values for user and authtoken in rootscope and http defaults (for future calls)
                        $http.defaults.headers.common['x-auth'] = $authToken;

                        //update cookies
                        $cookieStore.put('user', $rootScope.user);
                        $cookieStore.put('token', $authToken);

                        // use the alert service to notify that a user is logged in
                        alertService.add("login", "Welcome, " + $rootScope.user.username + "!");

                        $rootScope.user = {
                            'username': user.username,
                            isLogged: true,
                            role: userRoles.user,
                            'authtoken': $authToken
                        };
                        //console.log($rootScope.user);

                        //console.log ('token :' + $rootScope.user.authtoken);
                        $rootScope.user = user;
                        $rootScope.user.isLogged = true;
                        $rootScope.user.role = $rootScope.userRoles.user;
                        $rootScope.$broadcast('someoneLoggedIn');
                        $location.path('/home');

                    }).error(function(data, status) {
                        if (status === 404) {
                            console.log('bad login combo');
                            alertService.add('login_error', "Sorry buddy, guest services are down currently.  We're working to fix this!");
                        }
                        console.log(data);
                        console.log(status);
                    });

                },

                logout: function(success, error) {

                    console.log('Logged out!');
                    // $rootScope.user.
                    //alert($rootScope.user.username + "has been logged out");
                    $rootScope.user.username = "";
                    $rootScope.user.isLogged = false;
                    $rootScope.user.role = $rootScope.userRoles.visitor;
                    $cookieStore.remove("token");
                    //$scope.username = $cookieStore.get('user').username;
                    $cookieStore.remove("user");
                    //$cookieStore.put('user', $rootScope.user.username);
                    $rootScope.$broadcast('logOut');
                    $location.path('/');

                    // $http.post('/logout').success(function(){
                    //     $rootScope.user = {
                    //         username = '',
                    //         role = userRoles.public
                    //     };
                    //     success();
                    // }).error(error);
                },
            };
        }
    ]);
