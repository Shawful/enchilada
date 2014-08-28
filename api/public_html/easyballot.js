var express = require('express');
var app = express();
var server = require('http').createServer(app);
var http = require('https');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;

server.listen(3000);
var config = require('/opt/apps/properties/config.json');

app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/public')));
app.use(app.router);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


function requireAuth() {
    return function(req, res, next) {
        if (req.headers['x-auth'] != null) {
            var authtoken = req.headers['x-auth'];
            MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
                if (err)
                    throw err;

                var collection = db.collection('tokens');

                //FIND IF THE USERNAME AND PASSWORD EXIST
                collection.findOne({_id: authtoken}, function(err, token) {
                    if (err) {
                        return res.status(401).send("Unauthorized");
                    }

                    if (!token) {
                        return res.status(401).send("Unauthorized");
                    }
                    if (token.expiry > Date.now()) {
                        collection = db.collection('authentications');
                        collection.findOne({_id : token.user_id} , function(err,user){
                            if (err) {
                                return res.status(401).send("Unauthorized");
                            }
                            
                            req.params.user = user;
                            next();
                        });
                    }else
                        return res.status(403).send("Unauthorized token.");

                });

            });
        }
        else
            return res.status(403).send("no x-auth");

    }
}

app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendfile(__dirname + '/index.html');
  //return res.send("hello")
});

app.post('/user',function(req,res){ //CREATE A NEW ACCOUNT
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');


        var jsonBody = req.body;


        collection.insert(jsonBody, {safe: true}, function(err, records) {
            if (err) {
                return res.status(400).send("User already exists");
            }
            console.log("Record added as " + records[0]._id);
            return res.send("User added");
        });

    });
});

app.post('/user/login',function(req,res){ //LOGIN TO THE EXISTING ACCOUNT
    var username  = req.headers['x-username'];
    var password  = req.headers['x-password'];
    if(username == null || password == null){
        res.status(400).send("Username and password required");
    }
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');


        var jsonBody = req.body;

        //FIND IF THE USERNAME AND PASSWORD EXIST
        collection.findOne({_id : username}, function(err, result) {
            if (err) {
                return res.status(400).send("Failed");
            }
            if(result == null){
                return res.status(404).send("username/password incorrect");
            }
            
            var token = Math.random().toString(36).slice(2);
            
            var currentTime = Date.now();
            var expiry = currentTime+86400000; //adding a day to the current
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
});


app.put('/user/bills/:billId/:vote', requireAuth() , function(req, res) {  //VOTE ON CERTAIN BILL ID
    
    var user = req.params.user;
    var vote = req.param('vote');
    var billId = req.param('billId');
    if(!vote){
        return res.status(400).send("vote missing");
    }
   MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        var arrayName= "";
        if(vote == true){
            collection.update({_id : user._id} ,{$addToSet : { liked : billId}}, function(err, records) {
            if (err) {
                return res.status(400).send("failed to record vote");
            }else{
                collection.update({_id : user._id} ,{$pull : { disliked : billId}}, function(err, records) {
                if (err) {
                    console.log("failed to update the bill "+billId);
                }
                    
                    return res.send("Vote for the bill successfull");
                });
                
                
            }
            
            });
        }
        else{
            collection.update({_id : user._id} ,{$addToSet : { disliked : billId}}, function(err, records) {
            if (err) {
                return res.status(400).send("failed to record vote");
            }else{
                collection.update({_id : user._id} ,{$pull : { liked : billId}}, function(err, records) {
                if (err) {
                    console.log("failed to update the bill "+billId);
                }
                    
                    return res.send("Vote for the bill successfull");
                });
                
                
            }
            
            });
        }
        

    });
    
});