var sha1 = require('sha1');
var uuid = require('node-uuid');
var format = require('util').format;
var config = require('/opt/apps/properties/config.json');
var postmark = require("postmark")(config.postmarkApiEb);
var dbConnection = require('../services/dbconnector');

exports.createNewAccount = function() {
    return function(req, res) {
    
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");
        var collection = db.collection('authentications');


        var jsonBody = req.body;
        
        if(jsonBody){
        if(!jsonBody.password)    
            return res.status(400).send("Password is required");
        
        jsonBody.password = sha1(jsonBody.password);
        
        //adding verification rules
        jsonBody.verificationToken = uuid.v1();
        jsonBody.verified = false;
        
        
        collection.insert(jsonBody, {safe: true}, function(err, records) {
            if (err) {
                return res.status(400).send("User already exists");
            }
            console.log("Record added as " + records[0]._id);
            sendVerificationEmail(records[0]._id,jsonBody.verificationToken);
            return res.send("User added");
        });
        }else
            return res.status(400).send("Bad data");

    
    };
};

exports.login = function() {
    return function(req, res) {
    var username  = req.headers['x-username'];
    var password  = req.headers['x-password'];
    var rememberme = req.headers['x-rememberme'];
    
    if(username === null || password === null){
        res.status(400).send("Username and password required");
    }
    
        var db = dbConnection.getDbConnection();
                if(!db)
                    return res.status(500).send("Failed to initialize the db.");
        var collection = db.collection('authentications');
        
        
        password = sha1(password);
        
        
        
        //FIND IF THE USERNAME AND PASSWORD EXIST
        collection.findOne({_id : username ,  "password" : password , "verified" : true}, function(err, result) {
            if (err) {
                return res.status(400).send("Failed");
            }
            if(result === null){
                return res.status(404).send("username/password incorrect");
            }
            
            var token = Math.random().toString(36).slice(2);
            
            var currentTime = Date.now();
            var expiry;
            if(rememberme)
                expiry = currentTime+(86400000*7); //adding 7 days to the current
            else
                expiry = currentTime+86400000; //adding a day to the current
            
            var tokenCollection = db.collection("tokens");
            
            tokenCollection.insert({_id : token ,"user_id" : username , "expiry" : expiry},{safe: true},
                function(err,result){
                    if (err) {
                    return res.status(400).send("Failed to login");
                }
                return res.status(200).send({"token" : token});
            });
            
        });

    
    };
};


exports.verify = function(){
    return function(req, res) {
        var verificationCode = req.param('code');
        if(!verificationCode)
            return res.status(400).send("Verification code is missing");
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");

            var collection = db.collection('authentications');
            collection.findOne({"verificationToken" : verificationCode}, function(err, result) {
                if (err) {
                    return res.status(400).send("Failed");
                }
                if(result === null){
                    return res.status(404).send("Invalid verification code");
                }
                
                if(result.verified){
                    return res.status(404).send("Invalid verification code");
                }
                else{
                    collection.update({"verificationToken" : verificationCode},{$set :{"verified" : true , "verificationToken" : ""} } , function(err, docsUpdated){
                        if (err) {
                            return res.status(500).send("Internal server error");
                        }
                        
                        console.log("number of records updated during verification : "+docsUpdated);
                        return res.status(200).send("User verified"); 
                    });
                }
                
                
            });
            
    };
};

var sendVerificationEmail = function(email,verificationCode) {
    
        var link ="http://www.easyballot.org/#/user/verify/"+verificationCode;
        console.log('sending a link '+link);
        var emailBody = "<p>Hi Easyballot user,<br><br>\n\
                Please click the link copy and paste the below link to get the account verified.<br><br>\n\
                <br>\n\
                \n\
                <p>"+link+"</p><br><br>\n\
                Thank you,<br>\n\
                Easyballot Support team</p>";

        postmark.send({
            "From": "support@easyballot.org",
            "To": email,
            "Subject": "Activation email from Easyballot",
            //"HtmlBody": "<h1> <a href="+link+">verify</a> </h1>"
            "HtmlBody": emailBody

        }, function(error, success) {
            if (error) {
                console.error("Unable to send via postmark: " + error.message);
                return;
            }
            console.info("Sent to postmark for delivery");
            return;
            
        });

    
};

exports.getUserProfile = function (){
    return function(req,res){
        var user = req.params.user;
        
        var userProfile = new Object();
        userProfile.firstName = user.firstName;
        userProfile.lastName = user.lastName;
        userProfile.age = user.age;
        userProfile.sex = user.sex;
        userProfile.address = user.address;
        userProfile.zipcode = user.zipcode;
        userProfile.filters = user.filters;
        userProfile.share = user.share;
        userProfile.district = user.district;
        userProfile.state = user.state;
        userProfile.senators = user.senators;        
        return res.status(200).send(userProfile);
    };
};

exports.changeUserProfile = function() {
    return function(req , res){
        var user = req.params.user;
        var userProfile = req.body;
        
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");
        
            var collection = db.collection('authentications');
            collection.update({_id : user._id},{$set : userProfile},
                function(err,updatedRecords){
                    if (err) {
                    return res.status(400).send("Failed to update profile");
                }
                return res.status(200).send("updated records "+updatedRecords);
            });
        
        
    };
};

exports.checkUserNameAvailability = function() {
    return function(req , res){
        var email;
        if(req.body){
            email = req.body.email;
        }else{
            return res.status(400).send('Email required');
        }
            
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");
        
            var collection = db.collection('authentications');
            collection.findOne({_id : email},function(err,user){
                    if (err) {
                         return res.status(400).send("Failed to update profile");
                    }
                    if(user !== null)
                        return res.status(200).send({"available" : false});
                    else
                        return res.status(200).send({"available" : true});
            });
        
        
    };
};


exports.createGuestAccount = function() {
    return function(req, res) {
    
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");
        var collection = db.collection('authentications');
       var token = Math.random().toString(36).slice(2);
       var userProfile = new Object();
        userProfile._id = "guest_"+token+"@easyballot.org";
        userProfile.firstName = "guest";
        userProfile.lastName = "last";
        userProfile.password = token;
        userProfile.age = 27;
        userProfile.sex = "Male";
        userProfile.verified = true;
        userProfile.filters = getGuestFilters();
        userProfile.senators = [ { "id" : "C001056", "disagree" : 0 }, { "id" : "C001098", "disagree" : 0 }, { "id" : "D000399", "disagree" : 0 } ]; 
        
        var jsonBody = userProfile;
        
        if(jsonBody){
        if(!jsonBody.password)    
            return res.status(400).send("Password is required");
        
        jsonBody.password = sha1(jsonBody.password);
        
        //adding verification rules
        jsonBody.verificationToken = uuid.v1();
        jsonBody.verified = false;
        
        
        collection.insert(jsonBody, {safe: true}, function(err, records) {
            if (err) {
                return res.status(400).send("User already exists");
            }
            console.log("Record added as " + records[0]._id);
            
            var currentTime = Date.now();
            var expiry = currentTime+86400000; //adding a day to the current
            
            var tokenCollection = db.collection("tokens");
            
            tokenCollection.insert({_id : token ,"user_id" : userProfile._id , "expiry" : expiry},{safe: true},
                function(err,result){
                    if (err) {
                    return res.status(400).send("Failed to login");
                }
                return res.status(200).send({"token" : token});
            });
        });
        }else
            return res.status(400).send("Bad data");

    
    };
};


function getGuestFilters(){
    var filters = [		{
                "name": "Most Recent",
                "show": true,
                "query": "mostRecent"
            }, {
                "name": "Law Enforcement",
               "show": true,
                "query": "law enforcement"
            }, {
                "name": "Education",
               "show": true,
                "query": "education"
            }, {
                "name": "Health Care",
                "show": true,
                "query": "health care"
            }, {
                "name": "Veterans",
                "show": true,
                "query": "veterans"
            }, {
                "name": "Children",
                "show": true,
                "query": "children"
            }, {
                "name": "Minorities",
                "show": true,
                "query": "minority"
            }, {
                "name": "Foreign Aid",
               "show": true,
                "query": "foreign aid"
            }, {
                "name": "Immigration",
                "show": true,
                "query": "immigration"
            }, {
                "name": "Taxes",
                "show": true,
                "query": "taxes"
            }, {
                "name": "Defense Spending",
               "show": true,
                "query": "defense spending"
            }, {
                "name": "Privacy",
               "show": true,
                "query": "privacy"
            }, {
                "name": "Disaster Relief",
               "show": true,
                "query": "disaster relief"
            }, {
                "name": "Religion",
                "show": true,
                "query": "religion"
            }, {
                "name": "Women's Rights",
                "show": true,
                "query": "abortion"
            }, {
                "name": "LGBT",
               "show": true,
                "query": "lgbt"
            }];
        
        return filters;
}