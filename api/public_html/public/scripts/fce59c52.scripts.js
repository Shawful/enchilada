"use strict";var app=angular.module("politicheckApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ngAnimate","ui.keypress","mgo-angular-wizard","angulike"]),userRoles={visitor:1,user:2,admin:4},accessLevels={any:7,visitor:1,user:6,admin:4};app.config(["$routeProvider","$locationProvider",function(a){var b=accessLevels;a.when("/",{templateUrl:"views/landing.html",access:b.visitor}).when("/login",{templateUrl:"views/login.html",access:b.user}).when("/about",{templateUrl:"views/about.html",access:b.visitor}).when("/home",{templateUrl:"views/home.html",access:b.user}).when("/contact",{templateUrl:"views/home.html",access:b.user}).when("/register",{templateUrl:"views/login.html",access:b.visitor}).when("/tos",{templateUrl:"views/tos.html",access:b.visitor}).when("/user/verify/:accessCode",{templateUrl:"views/verify.html",access:b.visitor})}]),app.run(["$rootScope","$location","$cookieStore","$http","Auth",function(a,b,c,d,e){a.facebookAppId="345699855603648",a.urlRoot="http://ec2-54-85-38-129.compute-1.amazonaws.com:3000",a.userRoles={visitor:1,user:2,admin:4},a.accessLevels={any:7,visitor:1,user:6,admin:4},a.user=c.get("user")||{username:"",isLogged:!1,role:userRoles.visitor},d.defaults.headers.common["x-auth"]=c.get("x-auth"),""==a.user.username||e.login(a.user,function(){},function(){}),a.$on("$routeChangeStart",function(c,d){a.error=null,a.success=null,d.access&a.user.role||b.path(a.user.role===userRoles.user||a.user.role===userRoles.admin?"/":"/login")})}]),app.controller("loginCtrl",["$scope","$http","Auth","$rootScope","$injector","$cookieStore",function(a,b,c,d,e,f){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],"undefined"==typeof f.get("user")?console.log("no cookie!"):(a.username=d.user.username||f.get("user").username,a.remember=d.user.remember||f.get("user").remember,a.password=d.user.password||f.get("user").password),a.login=function(){d.user.username=a.username,d.user.password=a.password,d.user.remember=a.remember,c.login(d.user,function(){},function(){})}}]),app.controller("navCtrl",["$scope","$http","Auth","$rootScope",function(a,b,c){a.isLoggedIn=!1,a.toggle=function(){a.isLoggedIn=!a.isLoggedIn},a.logout=function(){c.logout()},a.$on("someoneLoggedIn",function(){a.toggle()}),a.$on("logOut",function(){a.toggle()})}]),app.controller("landingCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.noData=!1,a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")},a.$on("newSearch",function(){a.noData=!1,console.log("test")}),a.$on("search",function(){a.noData=!1,console.log("cleared out error message")}),a.$on("noData",function(){console.log("made it to the landing controller"),a.noData=!0,console.log(a.noData)})}]),app.controller("aboutCtrl",["$scope","$http","$rootScope","$location",function(a,b,c,d){a.sendToLoginPage=function(){1!=c.user.isLogged&&d.path("/login")}}]),app.controller("repCtrl",["$scope","$http","$rootScope","$location","$filter","$timeout",function(a,b,c,d,e,f){a.repImageURL="http://theunitedstates.io/images/congress/225x275/",a.repImageExtension=".jpg",a.id=[],b.get(c.urlRoot+"/user/reps").success(function(b){for(var c=[],d=0;d<b.length;d++)c[d]=b[d].worthiness,c[d]=e("number")(c[d],1);a.reps=[{firstName:b[0].first_name,lastName:b[0].last_name,bioguide_id:b[0].bioguide_id,repworthiness:c[0],role:"Senator"},{firstName:b[1].first_name,lastName:b[1].last_name,bioguide_id:b[1].bioguide_id,repworthiness:c[1],role:"Senator"},{firstName:b[2].first_name,lastName:b[2].last_name,bioguide_id:b[2].bioguide_id,repworthiness:c[2],role:"House Representative"}]}),c.$broadcast("voteCast"),a.$on("voteCast",function(){var d=(c.vote,[]);b.get(c.urlRoot+"/user/reps").success(function(b){d[0]=b[0].worthiness,d[1]=b[1].worthiness,d[2]=b[2].worthiness,a.id[0]=b[0].bioguide_id,a.id[1]=b[1].bioguide_id,a.id[2]=b[2].bioguide_id,a.percentHide=!0;for(var c=0;c<a.reps.length;c++){var g=[];g[c]=d[c],g[c]=e("number")(g[c],1),a.reps[c].repworthiness=g[c],a.reps[c].bioguide_id=b[c].bioguide_id,a.reps[c].imageURL=a.repImageURL+a.reps[c].bioguide_id+a.repImageExtension}f(function(){a.percentHide=!1},500),f(function(){a.percentShow=!0},1200)})})}]),angular.module("politicheckApp").controller("billCtrl",["$rootScope","$scope","$http","alertService","$filter","$timeout","Search",function(a,b,c,d,e,f,g){b.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],b.noData=!1,b.billSummary="pacos tacos";var h="health care";a.closeAlert=d.closeAlert,b.share={Name:"EasyBallot.org",ImageUrl:"http://www.easyballot.org"},c.get(a.urlRoot+'/bills/search/?bill="'+h+'"&per_page=5').success(function(a){g.setBills(a),b.bills=g.getBills()}),b.$on("newSearch",function(){b.noData=!1,f(function(){b.bills=g.getBills()},20)}),a.$on("search",function(){b.noData=!1,f(function(){b.bills=g.getBills()},900)}),b.$on("noData",function(){b.noData=!0}),b.remove=function(a){b.bills.splice(a,1)},b.getBillSummary=function(d,e){console.log("title clicked"),c.get(a.urlRoot+"/bills/summary/"+e).success(function(a){b.billSummary=a[0].summary_short?a[0].summary_short:"Unfortunately, this bill is not yet out of committee, and we are still waiting for the summary from the bill's authors.",console.log(a);var c=b.billSummary.length;1004==c?(console.log("length: "+c),console.log("there is a long version of this bill")):(console.log("short summary only"),console.log("length: "+c))}).error(function(){b.billSummary="Bill summary not present or an error occurred"})},b.vote=function(e,g,h){var i=0,j=2e3,k="",l={method:"POST",url:a.urlRoot+"/user/bills/"+h+"/"+g,headers:{"Content-Type":"application/json"}};f(function(){b.remove(e)},i),a.vote=g,c(l).success(function(){console.log("Voted!!!!"),a.$broadcast("voteCast")}).error(function(a){console.log("error when voting!!!!"),console.log(a)}),k="1"==g?"yay":"nay",f(function(){d.add("success","Thanks for voting "+k+"!")},j)}}]),angular.module("politicheckApp").controller("searchCtrl",["$rootScope","$scope","$http","Search",function(a,b,c,d){b.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],b.enterPressed=function(a){b.search(b.searchText),a.preventDefault()},b.search=function(e){d.clearBills(),b.$broadcast("clearSearch"),c.get(a.urlRoot+'/bills/search/?bill="'+e+'"&per_page=5').success(function(b){a.$broadcast("search"),d.setBills(b),0==b.results.length&&a.$broadcast("noData")}),b.newText=function(){a.$broadcast("newSearch"),console.log("problem is here")}}}]),app.controller("regCtrl",["$scope","$http","$rootScope","$location","alertService","Auth",function(a,b,c,d,e,f){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],c.reps=[],a.finishedWizard=function(){a.filters=[{name:"Most Recent",show:!0,query:"mostRecent"},{name:"Veterans",show:a.$$childTail.interest.veterans,query:"veterans"},{name:"Defense Spending",show:a.$$childTail.interest.defenseSpending,query:"defense spending"},{name:"Disaster Relief",show:a.$$childTail.interest.disasterRelief,query:"disaster relief"},{name:"Religion",show:a.$$childTail.interest.religion,query:"religion"},{name:"Women's Rights",show:a.$$childTail.interest.abortion,query:"abortion"},{name:"LGBT",show:a.$$childTail.interest.lgbt,query:"lgbt"},{name:"Health Care",show:a.$$childTail.interest.healthCare,query:"health care"},{name:"Children",show:a.$$childTail.interest.children,query:"children"},{name:"Education",show:a.$$childTail.interest.education,query:"education"},{name:"Taxes",show:a.$$childTail.interest.taxes,query:"taxes"},{name:"Minorities",show:a.$$childTail.interest.minority,query:"minority"},{name:"Privacy",show:a.$$childTail.interest.privacy,query:"privacy"}];var d={method:"POST",url:c.urlRoot+"/user",headers:{"Content-Type":"application/json"},data:{_id:a.$$childTail.email,password:a.$$childTail.passwordA,age:a.$$childTail.age,senators:[{id:a.$$childTail.reps[0],disagree:0},{id:a.$$childTail.reps[1],disagree:0},{id:a.$$childTail.reps[2],disagree:0}],firstName:a.$$childTail.firstName,lastName:a.$$childTail.lastName,sex:a.$$childTail.sex,tos:a.$$childTail.tos,share:a.$$childTail.share,address:a.$$childTail.address,zipcode:a.$$childTail.zipcode,state:a.$$childTail.state,district:a.$$childTail.district,filters:a.filters}};b(d).success(function(){e.add("registered","Successfully registered."),c.user.username=a.$$childTail.email,c.user.password=a.$$childTail.passwordA,c.user.remember=!0,f.login(c.user,function(){},function(){}),d={}}).error(function(a,b){400==b&&e.add("already_registered","Sorry, that user is already registered.")})},a.updateGeneralInfo=function(){a.validStepOne=!1,a.validFirstName=!1,a.validLastName=!0,a.validEmail=!1,a.validPasswordA=!1,a.validPasswordB=!1,a.validPasswordMatch=!1,a.validAge=!1,a.validSex=!1,a.validTOS=!1,a.$$childTail.firstName&&(a.validFirstName=!0),a.$$childTail.lastName&&(a.validLastName=!0),a.$$childTail.email&&(a.validEmail=!0),a.$$childTail.passwordA&&(a.validPasswordA=!0),a.$$childTail.passwordB&&(a.validPasswordB=!0),a.$$childTail.passwordA==a.$$childTail.passwordB?(a.validPasswordMatch=!0,a.$$childTail.validPasswordMatch=!0):(a.validPasswordMatch=!1,a.$$childTail.validPasswordMatch=!1),a.$$childTail.age&&(a.validAge=!0),a.$$childTail.sex&&(a.validSex=!0),a.$$childTail.tos&&(a.validTOS=!0),a.$$childTail.validStepOne=a.validFirstName&&a.validLastName&&a.validEmail&&a.validPasswordA&&a.validPasswordB&&a.validAge&&a.validSex&&a.validTOS&&a.validPasswordMatch},a.validateContact=function(){console.log("first step completed!"),a.updateLocationInfo=function(){a.validStepThree=!1,a.validZipcode=!1,a.$$childTail.zipcode&&(a.validZipcode=!0)}},a.districtChosen=function(b){a.$$childTail.state=a.$$childTail.districts[b].state,a.$$childTail.district=a.$$childTail.districts[b].district,a.$$childTail.rep=a.$$childTail.districts[b].first_name+" "+a.$$childTail.districts[b].last_name,a.$$childTail.reps[2]=a.$$childTail.districts[b].bioguide_id,a.validStepThree=!0},a.findReps=function(){a.address="",a.zipcode="",a.showMap=!1,a.pickDistrict=!1,a.showDistricts=!1;{var d={method:"POST",url:c.urlRoot+"/user/legislators",headers:{"Content-Type":"application/json"},data:{streetAddress:a.address,zipcode:a.zipcode}};({method:"POST",url:c.urlRoot+"/user/reps",headers:{"Content-Type":"application/json"},data:[]})}if(a.$$childTail.address)a.address=a.$$childTail.address.replace(/ /g,"+"),a.zipcode=a.$$childTail.zipcode,d.data={streetAddress:a.address,zipcode:a.zipcode},b(d).success(function(b){if(3==b.results.length){for(a.i=0;a.i<b.results.length;a.i++)"house"==b.results[a.i].chamber&&(a.repIndex=a.i);a.findSenatorIndexes=3-a.repIndex,3==a.findSenatorIndexes&&(b.results[1].last_name<b.results[2].last_name?(a.senatorAIndex=1,a.senatorBIndex=2):(a.senatorAIndex=2,a.senatorBIndex=1)),2==a.findSenatorIndexes&&(b.results[0].last_name<b.results[2].last_name?(a.senatorAIndex=0,a.senatorBIndex=2):(a.senatorAIndex=2,a.senatorBIndex=0)),1==a.findSenatorIndexes&&(b.results[0].last_name<b.results[1].last_name?(a.senatorAIndex=0,a.senatorBIndex=1):(a.senatorAIndex=1,a.senatorBIndex=0))}a.$$childTail.senatorA=b.results[a.senatorAIndex].first_name+" "+b.results[a.senatorAIndex].last_name,a.$$childTail.senatorB=b.results[a.senatorBIndex].first_name+" "+b.results[a.senatorBIndex].last_name,a.$$childTail.rep=b.results[a.repIndex].first_name+" "+b.results[a.repIndex].last_name,a.$$childTail.reps=[b.results[a.senatorAIndex].bioguide_id,b.results[a.senatorBIndex].bioguide_id,b.results[a.repIndex].bioguide_id],a.$$childTail.validStepThree=!0}).error(function(a,b){console.log(a),404===b&&(console.log("bad zipcode"),e.add("zipcode_error","Sorry, incorrect zipcode.")),500===b&&e.add("server_error","Sorry, server error.  Please try again.")});else if(a.$$childTail.zipcode){a.zipcode=JSON.stringify(a.$$childTail.zipcode);var f={method:"GET",url:c.urlRoot+"/zipcode/"+a.zipcode+"/reps",headers:{"Content-Type":"application/json"}};b(f).success(function(b){for(a.i=0;a.i<b.results.length;a.i++)if("senate"==b.results[a.i].chamber){a.tempAIndex=a.i;break}for(a.i=a.tempAIndex+1;a.i<b.results.length;a.i++)"senate"==b.results[a.i].chamber&&(a.tempBIndex=a.i);b.results[a.tempAIndex].last_name<b.results[a.tempBIndex].last_name?(a.senatorAIndex=a.tempAIndex,a.senatorBIndex=a.tempBIndex):(a.senatorAIndex=a.tempBIndex,a.senatorBIndex=a.tempAIndex),a.$$childTail.reps=[b.results[a.senatorAIndex].bioguide_id,b.results[a.senatorBIndex].bioguide_id,"???????"],a.$$childTail.senatorA=b.results[a.senatorAIndex].first_name+" "+b.results[a.senatorAIndex].last_name,a.$$childTail.senatorB=b.results[a.senatorBIndex].first_name+" "+b.results[a.senatorBIndex].last_name,a.senatorAIndex>a.senatorBIndex?(b.results.splice(a.senatorAIndex,1),b.results.splice(a.senatorBIndex,1)):(b.results.splice(a.senatorBIndex,1),b.results.splice(a.senatorAIndex,1)),a.$$childTail.districts=b.results.slice(),1==b.results.length?(a.$$childTail.pickDistrict=!1,a.$$childTail.showMap=!1,a.$$childTail.showDistricts=!1,a.districtChosen(0)):(a.$$childTail.pickDistrict=!0,a.$$childTail.showMap=!0,a.$$childTail.showDistricts=!0,a.$$childTail.rep="[Click Green District Button Using Map]")}).error(function(a,b){console.log(a),console.log("status : "+b)})}}}]),angular.module("politicheckApp").controller("filterCtrl",["$rootScope","$scope","$http","alertService","$filter","$timeout","Search",function(a,b,c,d,e,f,g){b.selectedIndex=0,b.filters=[{name:"Most Recent",show:!0,query:"mostRecent"},{name:"Women's Issues",show:!0,query:"Abortion"},{name:"Taxes",show:!0,query:"taxes"},{name:"LGBT",show:!1,query:"gay"}],c.get(a.urlRoot+"/user/filters").success(function(a){b.filters=a}).error(function(a){console.log("error occurred getting filters"),console.log(a),b.filters=[{name:"Most Recent",show:!0,query:"mostRecent"},{name:"Health Care",show:!0,query:"health care"},{name:"Taxes",show:!0,query:"taxes"},{name:"Jobs",show:!0,query:"jobs"}]}),b.filterSearch=function(d,e){b.selectedIndex=e,"mostRecent"==d?c.get(a.urlRoot+"/bills/recent").success(function(b){console.log("just got the most recent bills");var c=b.results.slice(0,5),d={results:c};g.clearBills(),g.setBills(d),a.$broadcast("search")}).error(function(a){console.log("got an error trying to get the most recent bills"),console.log(a)}):(g.clearBills(),c.get(a.urlRoot+'/bills/search/?bill="'+d+'"&per_page=5').success(function(b){g.setBills(b),a.$broadcast("search"),0==b.results.length&&a.$broadcast("noData")}).error(function(a,b){console.log("couldn't find anything"),console.log(b),console.log(a)}))}}]),app.controller("contactCtrl",["$scope","$http","$rootScope","$location","alertService",function(a,b,c,d,e){a.disableSend=!0,a.contactUsMessage="",a.subject="",a.updateContactUsForm=function(){a.disableSend=""!=a.contactUsMessage&&""!=a.subject?!1:!0},a.sendEmailToAdmin=function(){e.add("email_sent","Thanks!  Your email has been sent.");var d={method:"POST",url:c.urlRoot+"/contact",headers:{"Content-Type":"application/json"},data:{subject:a.subject,body:a.contactUsMessage}};b(d).success(function(a){console.log(a)}).error(function(a,b){console.log(a),console.log(b)})}}]),app.controller("paginationCtrl",["$scope","$http","$rootScope","$location",function(a,b,c){a.searchFinished=!0,a.totalItems=64,a.currentPage=4,a.setPage=function(b){a.currentPage=b},a.pageChanged=function(){console.log("Page changed to: "+a.currentPage)},a.maxSize=5,a.bigTotalItems=175,a.bigCurrentPage=1,c.$on("noData",function(){a.searchFinished=!1,console.log("hide bar, no data")}),c.$on("search",function(){a.searchFinished=!0})}]),angular.module("politicheckApp").controller("verifyCtrl",["$scope","$http","$location","$routeParams","$rootScope",function(a,b,c,d,e){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],console.log(d.accessCode),a.error=!1;var f={method:"POST",url:e.urlRoot+"/user/verify/"+d.accessCode,headers:{"Content-Type":"application/json"}};b(f).success(function(){c.path("/login")}).error(function(){a.error=!0})}]),angular.module("politicheckApp").directive("pop",["$animate",function(a){return{template:"",restrict:"A",link:function(b,c){c.hover(function(){c.preventDefault,c.hasClass("rubberBand")&&c.removeClass("rubberBand"),c.hasClass("animated")||c.addClass("animated"),c.hasClass("pulse")||a.addClass(c,"pulse")},function(){c.hasClass("pulse")&&c.removeClass("pulse")})}}}]),angular.module("politicheckApp").directive("votePercentAnimation","$animate",function(){return{template:"",restrict:"A",link:function(a,b,c){a.$watch(c.votePercentAnimation,function(a,b){a!=b&&console.log("test")})}}}),angular.module("politicheckApp").directive("autoFocus",["$timeout",function(a){return{restrict:"AC",link:function(b,c){a(function(){c[0].focus()},0)}}}]),angular.module("politicheckApp").directive("fadeMiddle",["$animate",function(a){return{template:"",restrict:"A",link:function(b,c){c.hover(function(){c.preventDefault,c.$middle&&(c.removeClass("fadeLast"),c.addClass("fadeMiddle")),c.hasClass("animated")||c.addClass("animated"),c.hasClass("fadeMiddle")||a.addClass(c,"fadeMiddle"),$compile(c)(b)},function(){})}}}]),angular.module("politicheckApp").factory("Auth",["$http","$rootScope","$cookieStore","$location","alertService",function(a,b,c,d,e){return{authorize:function(a,c){return void 0===c&&(c=b.user.role),a&c},logMeIn:function(){alert("working")},isLoggedIn:function(a){return void 0===a&&(a=b.user),a.role===userRoles.user||a.role===userRoles.admin},register:function(){},login:function(f){b.user=f;var g={method:"POST",url:b.urlRoot+"/user/login",headers:{"Content-Type":"application/json","x-username":f.username,"x-password":f.password,"x-rememberme":f.remember}};a(g).success(function(g){console.log("Logged in!");var h=g.token;a.defaults.headers.common["x-auth"]=h,c.put("user",b.user),c.put("token",h),e.add("login","Welcome, "+b.user.username+"!"),b.user={username:f.username,isLogged:!0,role:userRoles.user,authtoken:h},b.user=f,b.user.isLogged=!0,b.user.role=b.userRoles.user,b.$broadcast("someoneLoggedIn"),d.path("/home")}).error(function(a,b){404===b&&(console.log("bad login combo"),e.add("login_error","Sorry, incorrect user name or password combination."))})},logout:function(){console.log("Logged out!"),b.user.username="",b.user.isLogged=!1,b.user.role=b.userRoles.visitor,c.remove("token"),c.remove("user"),b.$broadcast("logOut"),d.path("/")}}}]),angular.module("politicheckApp").factory("alertService",["$rootScope","$timeout",function a(b,c){var a={};return b.alerts=[],a.add=function(a,d){b.alerts.push({type:a,msg:d}),c(function(){b.alerts.splice(0,1)},2e3)},a.closeAlert=function(a){b.alerts.splice(a,1)},a}]),angular.module("politicheckApp").factory("Search",["$http","$rootScope",function(){var a=[];return{getBills:function(){return a},setBills:function(b){a=b.results;for(var c=0;c<a.length;c++)null==a[c].short_title&&(a[c].short_title=a[c].official_title.slice(0,45)+" ...")},clearBills:function(){a&&(a.length=0)}}}]);