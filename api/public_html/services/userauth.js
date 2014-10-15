var sha1 = require('sha1');
var uuid = require('node-uuid');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;
        
exports.createNewAccount = function() {
    return function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

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
            return res.send("User added");
        });
        }else
            return res.status(400).send("Bad data");

    });
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
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        
        
        password = sha1(password);
        
        
        
        //FIND IF THE USERNAME AND PASSWORD EXIST
        collection.findOne({_id : username ,  "password" : password , "verified" : true}, function(err, result) {
            if (err) {
                return res.status(400).send("Failed");
            }
            if(result == null){
                return res.status(404).send("username/password incorrect");
            }
            
            var token = Math.random().toString(36).slice(2);
            
            var currentTime = Date.now();
            var expiry ;
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

    });
    };
};


exports.verify = function(){
    return function(req, res) {
        var verificationCode = req.param('code');
        if(!verificationCode)
            return res.status(400).send("Verification code is missing");
        MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
            if (err)
            throw err;

            var collection = db.collection('authentications');
            collection.findOne({"verificationToken" : verificationCode}, function(err, result) {
                if (err) {
                    return res.status(400).send("Failed");
                }
                if(result == null){
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
        });    
    };
};