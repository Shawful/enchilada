var express = require('express');
var app = express();
var server = require('http').createServer(app);
var http = require('https');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;

server.listen(3000);
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
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

//SAVE USER ZIP CODE
app.put('/user/zipcode/:zipcode', requireAuth() , function(req, res) { //IGNORE A CERTAIN BILL ID
    
    var user = req.params.user;
    var zipcode = req.param('zipcode');
    
   MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
            collection.update({_id : user._id} ,{$set : { "zipcode ": zipcode}}, function(err, records) {
            if (err) {
                return res.status(400).send("failed to record vote");
            }
            return res.send("zipcode saved");
            });
        });
});

//SAVE ZIPCODE BASED REPS  Req body : ["asdasd","adasdas"]
app.put('/user/reps', requireAuth() , function(req, res) { //IGNORE A CERTAIN BILL ID
    var user = req.params.user;
    var jsonBody = req.body;
    
   MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
            collection.update({_id : user._id} ,{$addToSet:{"reps" : {$each : jsonBody}}}, function(err, records) {
            if (err) {
                return res.status(400).send("failed to record vote");
            }
            return res.send("Reps saved");
            });
        });
});

// USER VOTE FOR A BILL ID ... HAS A BUG WHEN TRYING TO VOTE ON SAME BILL
app.post('/user/bills/:billId/:vote', requireAuth(), function(req, res) {  //VOTE ON CERTAIN BILL ID

    var user = req.params.user;
    var vote = req.param('vote');
    var billId = req.param('billId');
    var senators = user.senators;
    if (!vote) {
        return res.status(400).send("vote missing");
    }
    if (vote == 1)
        vote = true;
    else
        vote = false;

    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        var arrayName = "";
        collection.update({_id: user._id}, {$addToSet: {votes: {"bill_id": billId, "vote": vote}}}, function(err, records) {
            if (err) {
                console.log(err);
                return res.status(400).send("failed to record vote");
            } else {
                for (var i in senators) {
                    var senator = senators[i];
                    var options = {
                        host: 'congress.api.sunlightfoundation.com',
                        path: '/votes?voter_ids.' + senator.id + '__exists=true&vote_type=passage&bill_id=' + billId + '&fields=voters.' + senator.id + '.vote',
                        method: 'GET',
                        headers: {'x-apikey': apikey}
                    };

                    var senatorVote = http.request(options, function(response) {
                        response.on('data', function(data) {
                            data = JSON.parse(data);
                            if (data.count > 0) {
                                var biodguideId = senator.id;
                                console.log(data.results[0].voters[biodguideId].vote);
                                if ((vote === true && data.results[0].voters[biodguideId].vote != "Yea") ||
                                        (vote === false && data.results[0].voters[biodguideId].vote === "Yea")) {
                                    collection.update({_id: user._id, "senators.id": biodguideId}, {$inc : {"senators.$.disagree" : 1}}, function(err, records) {
                                        if (err) {
                                            console.log("Disagreement failed with  "+err);
                                        } else {
                                            console.log("successfully recorded disagreement");

                                        }
                                    });
                                }
                            }
                        });
                        response.on('error', function(e) {
                            console.log(e);
                        });
                    });
                    senatorVote.write("");
                    senatorVote.end();
                }
                return res.send("Vote for the bill successfull");
            }
        });
    });
});


//UPDATE A USER VOTE FOR A BILL ID
app.put('/user/bills/:billId/:vote', requireAuth(), function(req, res) {  //VOTE ON CERTAIN BILL ID

    var user = req.params.user;
    var vote = req.param('vote');
    var billId = req.param('billId');
    if (!vote) {
        return res.status(400).send("vote missing");
    }
    if(vote==1)
        vote =true;
    else
        vote =false;
    
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        collection.update({_id: user._id ,  "votes.bill_id" : billId}, {$set :{"votes.$.vote" : vote}}, function(err, records) {
                if (err) {
                    return res.status(400).send("failed to record vote");
                } else {
                    collection.update({_id: user._id}, {$pull: {disliked: billId}}, function(err, records) {
                        if (err) {
                            console.log("failed to update the bill " + billId);
                        }

                        return res.send("Vote for the bill successfull");
                    });

                }
        });
    });

});


//GET ALL THE LIKED BILLS
app.get('/user/bills/liked', requireAuth(), function(req, res) {
    var apikey = config.sunlight_apikey;
    var user = req.params.user;
    var billCount = 0;
    var timelineObjects = [];
    if (user.liked.length > 0) {
        
        for (var i in user.liked) {
            var billId = user.liked[i];
            
            var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?bill_id=' + billId + '&fields=bill_id,official_title,short_title',
                method: 'GET',
                headers: {'x-apikey': apikey }
            };

            var bills = http.request(options, function(response) {
                response.on('data', function(data) {
                    data = JSON.parse(data);
                    timelineObjects.push(data.results[0]);


                    if (billCount == user.liked.length - 1) {
                        //console.log(timelineObjects);
                        return res.send(timelineObjects);
                    }
                    billCount++;

                });
                response.on('error', function(e) {
                    console.log(e);
                    return  res.status(400).send(e);
                });
            });
            bills.write("");
            bills.end();

        }
    }
    else
        return res.status(200).send(user.liked);
});


//GET ALL THE DISLIKED BILLS
app.get('/user/bills/disliked', requireAuth() , function(req, res) {
    var apikey = config.sunlight_apikey;
    var user = req.params.user;
    var billCount = 0;
    var timelineObjects = [];
    if (user.disliked.length > 0) {
        
        for (var i in user.disliked) {
            var billId = user.disliked[i];
            
            var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?bill_id=' + billId + '&fields=bill_id,official_title,short_title',
                method: 'GET',
                headers: {'x-apikey': apikey }
            };

            var bills = http.request(options, function(response) {
                response.on('data', function(data) {
                    data = JSON.parse(data);
                    timelineObjects.push(data.results[0]);


                    if (billCount == user.disliked.length - 1) {
                        //console.log(timelineObjects);
                        return res.send(timelineObjects);
                    }
                    billCount++;

                });
                response.on('error', function(e) {
                    console.log(e);
                    return  res.status(400).send(e);
                });
            });
            bills.write("");
            bills.end();

        }
    }
    else
        return res.status(200).send(user.disliked);
});



//CALCULATE REP WORTHINESS
app.get('/user/reps', requireAuth() , function(req, res) {
    var user = req.params.user;
    var totalVoteCount = user.votes.length ;
    
    var senators = user.senators;
    
    var repWorthiness = [];
    for(var i in senators){
        var senator = senators[i];
        if(totalVoteCount ==0)
            var worthiness = 100;
        else
            var worthiness = ((totalVoteCount -senator.disagree)/totalVoteCount)*100;
        
        repWorthiness.push({"bioguide_id" : senator.id , "worthiness" : worthiness});
    }
    
    return res.status(200).send(repWorthiness);
    
});

