"use strict";var app=angular.module("politicheckApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ngAnimate"]),userRoles={visitor:1,user:2,admin:4},accessLevels={any:7,visitor:1,user:6,admin:4};app.config(["$routeProvider","$locationProvider",function(a){var b=accessLevels;a.when("/",{templateUrl:"views/landing.html",access:b.visitor}).when("/login",{templateUrl:"views/login.html",access:b.user}).when("/about",{templateUrl:"views/about.html",access:b.visitor}).when("/home",{templateUrl:"views/home.html",access:b.user}).when("/contact",{templateUrl:"views/home.html",access:b.user}).when("/register",{templateUrl:"views/login.html",access:b.visitor}).otherwise({redirectTo:"/"})}]),app.run(["$rootScope","$location","$cookieStore","Auth",function(a,b,c){a.urlAuth="http://ec2-54-85-38-129.compute-1.amazonaws.com:3000/user/login",a.userRoles={visitor:1,user:2,admin:4},a.accessLevels={any:7,visitor:1,user:6,admin:4},a.user=c.get("user")||{username:"",isLogged:!1,role:userRoles.visitor},a.$on("$routeChangeStart",function(c,d){a.error=null,a.succes=null,d.access&a.user.role||b.path(a.user.role===userRoles.user||a.user.role===userRoles.admin?"":"/login")})}]),app.controller("loginCtrl",["$scope","$http","Auth","$rootScope","$injector",function(a,b,c,d){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.login=function(){d.user.username=a.username,d.user.password=a.password,c.login(d.user,function(){},function(){})}}]),angular.module("politicheckApp").factory("Auth",["$http","$rootScope","$cookieStore","$location","alertService",function(a,b,c,d,e){return{authorize:function(a,c){return void 0===c&&(c=b.user.role),a&c},logMeIn:function(){alert("working")},isLoggedIn:function(a){return void 0===a&&(a=b.user),a.role===userRoles.user||a.role===userRoles.admin},register:function(){},login:function(f){b.user=f;var g={method:"POST",url:b.urlAuth,headers:{"Content-Type":"application/json","x-username":f.username,"x-password":f.password}};a(g).success(function(g){console.log("Logged in!");var h=g.token;a.defaults.headers.common["x-auth"]=h,c.put("user",b.user),c.put("token",h),e.add("login","Welcome, "+b.user.username+"!"),b.user={username:f.username,authtoken:h},b.user=f,b.user.isLogged=!0,b.user.role=b.userRoles.user,b.$broadcast("someoneLoggedIn"),d.path("/home")}).error(function(a,c){401===c&&b.$broadcast("login_error","hmmm...can't find that login combo.")})},logout:function(){b.user.username="",b.user.isLogged=!1,b.user.role=b.userRoles.visitor,b.$broadcast("logOut"),d.path("/")}}}]),app.controller("navCtrl",["$scope","$http","Auth","$rootScope",function(a,b,c){a.isLoggedIn=!1,a.toggle=function(){a.isLoggedIn=!a.isLoggedIn},a.logout=function(){c.logout()},a.$on("someoneLoggedIn",function(){a.toggle()}),a.$on("logOut",function(){a.toggle()})}]),app.controller("landingCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")}}]),app.controller("aboutCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")}}]),app.controller("repCtrl",["$scope","$http","$rootScope","$location","$filter","$timeout",function(a,b,c,d,e,f){b.get("json/reps.json").success(function(b){a.reps=b,c.reps=b}),a.$on("voteCast",function(){var b=c.vote;a.percentHide=!0;for(var d=0;d<a.reps.length;d++){var g=0;console.log(b),"nay"==c.vote?(g=angular.fromJson(a.reps[d].repworthiness)-1,g=e("number")(g,2)):"yay"==c.vote&&(g=angular.fromJson(a.reps[d].repworthiness)+1,g=e("number")(g,2)),console.log("correct: "+g),console.log("before: "+a.reps[d].repworthiness),a.reps[d].repworthiness=g,console.log("after: "+a.reps[d].repworthiness)}console.log("            "),f(function(){a.percentHide=!1},500),f(function(){a.percentShow=!0},1200)})}]),angular.module("politicheckApp").controller("billCtrl",["$rootScope","$scope","$http","alertService","$filter","$timeout",function(a,b,c,d,e,f){b.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.closeAlert=d.closeAlert,c.get("json/bills.json").success(function(a){b.bills=a}),b.remove=function(a){b.bills.splice(a,1)},b.vote=function(c,e){var g=0,h=2e3;f(function(){b.remove(c)},g),a.vote=e,a.$broadcast("voteCast"),f(function(){d.add("success","Thanks for voting "+e+"!")},h)}}]),angular.module("politicheckApp").directive("pop",["$animate",function(a){return{template:"",restrict:"A",link:function(b,c){c.hover(function(){c.preventDefault,c.hasClass("rubberBand")&&c.removeClass("rubberBand"),c.hasClass("animated")||c.addClass("animated"),c.hasClass("pulse")||a.addClass(c,"pulse")},function(){c.hasClass("pulse")&&c.removeClass("pulse")})}}}]),angular.module("politicheckApp").factory("alertService",["$rootScope","$timeout",function a(b,c){var a={};return b.alerts=[],a.add=function(a,d){b.alerts.push({type:a,msg:d}),c(function(){b.alerts.splice(0,1)},2e3)},a.closeAlert=function(a){b.alerts.splice(a,1)},a}]),angular.module("politicheckApp").directive("votePercentAnimation","$animate",function(){return{template:"",restrict:"A",link:function(a,b,c){a.$watch(c.votePercentAnimation,function(a,b){a!=b&&console.log("test")})}}});