"use strict";var app=angular.module("politicheckApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ngAnimate","ui.keypress","mgo-angular-wizard"]),userRoles={visitor:1,user:2,admin:4},accessLevels={any:7,visitor:1,user:6,admin:4};app.config(["$routeProvider","$locationProvider",function(a){var b=accessLevels;a.when("/",{templateUrl:"views/landing.html",access:b.visitor}).when("/login",{templateUrl:"views/login.html",access:b.user}).when("/about",{templateUrl:"views/about.html",access:b.visitor}).when("/home",{templateUrl:"views/home.html",access:b.user}).when("/contact",{templateUrl:"views/home.html",access:b.user}).when("/register",{templateUrl:"views/login.html",access:b.visitor}).when("/junk",{templateUrl:"views/junk.html"}).otherwise({redirectTo:"/"})}]),app.run(["$rootScope","$location","$cookieStore","$http","Auth",function(a,b,c,d,e){a.urlRoot="http://ec2-54-85-38-129.compute-1.amazonaws.com:3000",a.userRoles={visitor:1,user:2,admin:4},a.accessLevels={any:7,visitor:1,user:6,admin:4},a.user=c.get("user")||{username:"",isLogged:!1,role:userRoles.visitor},d.defaults.headers.common["x-auth"]=c.get("x-auth"),""==a.user.username||e.login(a.user,function(){},function(){}),a.$on("$routeChangeStart",function(c,d){a.error=null,a.succes=null,d.access&a.user.role||b.path(a.user.role===userRoles.user||a.user.role===userRoles.admin?"/":"/login")})}]),app.controller("loginCtrl",["$scope","$http","Auth","$rootScope","$injector","$cookieStore",function(a,b,c,d,e,f){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],"undefined"==typeof f.get("user")?console.log("no cookie!"):(a.username=d.user.username||f.get("user").username,a.remember=d.user.remember||f.get("user").remember,a.password=d.user.password||f.get("user").password),a.login=function(){d.user.username=a.username,d.user.password=a.password,d.user.remember=a.remember,c.login(d.user,function(){},function(){})}}]),app.controller("navCtrl",["$scope","$http","Auth","$rootScope",function(a,b,c){a.isLoggedIn=!1,a.toggle=function(){a.isLoggedIn=!a.isLoggedIn},a.logout=function(){c.logout()},a.$on("someoneLoggedIn",function(){a.toggle()}),a.$on("logOut",function(){a.toggle()})}]),app.controller("landingCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")}}]),app.controller("aboutCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")}}]),app.controller("repCtrl",["$scope","$http","$rootScope","$location","$filter","$timeout",function(a,b,c,d,e,f){b.get("json/reps.json").success(function(b){a.reps=b,c.reps=b,c.$broadcast("voteCast")}),a.$on("voteCast",function(){var d=(c.vote,[]);b.get(c.urlRoot+"/user/reps").success(function(b){console.log("data rep id:"+b[0].bioguide_id),console.log("data rep %:"+b[0].worthiness),d[0]=b[0].worthiness,d[1]=b[1].worthiness,d[2]=b[2].worthiness,a.percentHide=!0;for(var c=0;c<a.reps.length;c++){var g=[];g[c]=d[c],console.log(g[c]),g[c]=e("number")(g[c],1),console.log("percentages: "+d[c]),console.log("newRepWorth: "+g[c]),console.log("before: "+a.reps[c].repworthiness),a.reps[c].repworthiness=g[c],console.log("after: "+a.reps[c].repworthiness)}console.log("            "),f(function(){a.percentHide=!1},500),f(function(){a.percentShow=!0},1200)})})}]),angular.module("politicheckApp").controller("billCtrl",["$rootScope","$scope","$http","alertService","$filter","$timeout","Search",function(a,b,c,d,e,f,g){b.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"];var h="health care";a.closeAlert=d.closeAlert,c.get(a.urlRoot+'/bills/search/?bill="'+h+'"&per_page=5').success(function(a){g.setBills(a),b.bills=g.getBills()}),a.$on("search",function(){f(function(){b.bills=g.getBills()},900)}),b.remove=function(a){b.bills.splice(a,1)},b.vote=function(e,g,h){var i=0,j=2e3,k="",l=({method:"POST",url:a.urlRoot+"/user/bills/"+h+"/"+g,headers:{"Content-Type":"application/json"}},{method:"PUT",url:a.urlRoot+"/user/bills/"+h+"/"+g,headers:{"Content-Type":"application/json"}});f(function(){b.remove(e)},i),a.vote=g,c(l).success(function(){console.log("ReVoted!!!!"),a.$broadcast("voteCast")}),k="1"==g?"yay":"nay",f(function(){d.add("success","Thanks for voting "+k+"!")},j)}}]),angular.module("politicheckApp").controller("searchCtrl",["$rootScope","$scope","$http","Search",function(a,b,c,d){b.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],b.enterPressed=function(a){b.search(b.searchText),a.preventDefault()},b.search=function(b){d.clearBills(),c.get(a.urlRoot+'/bills/search/?bill="'+b+'"&per_page=5').success(function(b){d.setBills(b),a.$broadcast("search")})}}]),app.controller("regCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.updateGeneralInfo=function(){a.validStepOne=!1,a.validFirstName=!1,a.validLastName=!0,a.validEmail=!1,a.validAge=!1,a.validSex=!1,a.$$childTail.firstName&&(a.validFirstName=!0),a.$$childTail.lastName&&(a.validLastName=!0),a.$$childTail.email&&(a.validEmail=!0),a.$$childTail.age&&(a.validAge=!0),a.$$childTail.sex&&(a.validSex=!0),a.$$childTail.validStepOne=a.validFirstName&&a.validLastName&&a.validEmail&&a.validAge&&a.validSex},a.validateContact=function(){console.log("first step completed!"),a.updateLocationInfo=function(){a.validStepThree=!1,a.validZipcode=!1,a.$$childTail.zipcode&&(a.validZipcode=!0)},a.findReps=function(){console.log("made it"),console.log(a.$$childTail.address),console.log(a.$$childTail.zipcode),console.log(a)}}}]),angular.module("politicheckApp").directive("pop",["$animate",function(a){return{template:"",restrict:"A",link:function(b,c){c.hover(function(){c.preventDefault,c.hasClass("rubberBand")&&c.removeClass("rubberBand"),c.hasClass("animated")||c.addClass("animated"),c.hasClass("pulse")||a.addClass(c,"pulse")},function(){c.hasClass("pulse")&&c.removeClass("pulse")})}}}]),angular.module("politicheckApp").directive("votePercentAnimation","$animate",function(){return{template:"",restrict:"A",link:function(a,b,c){a.$watch(c.votePercentAnimation,function(a,b){a!=b&&console.log("test")})}}}),angular.module("politicheckApp").directive("autoFocus",["$timeout",function(a){return{restrict:"AC",link:function(b,c){a(function(){c[0].focus()},0)}}}]),angular.module("politicheckApp").factory("Auth",["$http","$rootScope","$cookieStore","$location","alertService",function(a,b,c,d,e){return{authorize:function(a,c){return void 0===c&&(c=b.user.role),a&c},logMeIn:function(){alert("working")},isLoggedIn:function(a){return void 0===a&&(a=b.user),a.role===userRoles.user||a.role===userRoles.admin},register:function(){},login:function(f){b.user=f;var g={method:"POST",url:b.urlRoot+"/user/login",headers:{"Content-Type":"application/json","x-username":f.username,"x-password":f.password,"x-remember":f.remember}};a(g).success(function(g){console.log("Logged in!");var h=g.token;a.defaults.headers.common["x-auth"]=h,c.put("user",b.user),c.put("token",h),e.add("login","Welcome, "+b.user.username+"!"),b.user={username:f.username,isLogged:!0,role:userRoles.user,authtoken:h},b.user=f,b.user.isLogged=!0,b.user.role=b.userRoles.user,b.$broadcast("someoneLoggedIn"),d.path("/home")}).error(function(a,b){404===b&&(console.log("bad login combo"),e.add("login_error","Sorry, incorrect user name or password combination."))})},logout:function(){console.log("Logged out!"),b.user.username="",b.user.isLogged=!1,b.user.role=b.userRoles.visitor,b.$broadcast("logOut"),d.path("/")}}}]),angular.module("politicheckApp").factory("alertService",["$rootScope","$timeout",function a(b,c){var a={};return b.alerts=[],a.add=function(a,d){b.alerts.push({type:a,msg:d}),c(function(){b.alerts.splice(0,1)},2e3)},a.closeAlert=function(a){b.alerts.splice(a,1)},a}]),angular.module("politicheckApp").factory("Search",["$http","$rootScope",function(){var a=[];return{getBills:function(){return a},setBills:function(b){a=b},clearBills:function(){a.length=0}}}]);