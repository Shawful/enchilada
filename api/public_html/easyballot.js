var express = require('express');
var cors = require('cors');
var app = express();
var server = require('http').createServer(app);
var http = require('https');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;
var Promise = require('promise');
var querystring = require("querystring");

app.use(cors());
server.listen(3000);
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/public')));
app.use(app.router);




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
        collection.findOne({_id : username ,  "password" : password}, function(err, result) {
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

//GETS THE SAVED ZIPCODE
app.get('/user/zipcode', requireAuth() , function(req, res){
    var user = req.params.user;
    if(user.zipcode){
        return res.status(200).send({"zipcode" : user.zipcode});
    }
    else
        return res.status(404).send("Zipcode not found for user");
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
    var userVotes = user.votes;
    for (var iter in userVotes) {
        if (billId === userVotes[iter]["bill_id"])
            return res.status(400).send("Cannot recast a vote on a bill.");
    }

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
                    var bioguideId = senator.id;

                    var options = {
                        host: 'congress.api.sunlightfoundation.com',
                        path: '/votes?voter_ids.' + bioguideId + '__exists=true&vote_type=passage&bill_id=' + billId + '&fields=voters.' + bioguideId + '.vote',
                        method: 'GET',
                        headers: {'x-apikey': apikey}
                    };


                    var promise = callSunlight(options, bioguideId);
                    promise.then(function(data) {

                        if (data.count > 0) {
                            var senatorId = Object.keys(data.results[0].voters)[0]; //TO RETRIEVE KEY NAME FROM THE JSON BODY


                            if (data.results[0].voters[senatorId]) {

                                if ((vote === true && data.results[0].voters[senatorId].vote != "Yea") ||
                                        (vote === false && data.results[0].voters[senatorId].vote === "Yea")) {
                                    console.log("recording disagreement for " + senatorId);
                                    collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                        if (err) {
                                            console.log("Disagreement failed with  " + err);
                                        } else {
                                            console.log("successfully recorded disagreement");

                                        }
                                    });
                                }
                            }
                        }

                    }, function(error) {
                        console.log("promise rejected with " + error);
                    });

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
    var senators = user.senators;
    if (!vote) {
        return res.status(400).send("vote missing");
    }

    if (vote == 1)
        vote = true;
    else if (vote == 0)
        vote = false;

    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        var condition;
        if (vote == -1) {
            condition = '{ "_id" : ' + user._id + '} , {$pull : {"votes" : {"bill_id" : ' + billId + '} } }';
        } else {
            condition = '{"_id": ' + user._id + ', "votes.bill_id": ' + billId + '}, {$set: {"votes.$.vote": ' + vote + '}} ';
        }
        if (vote != -1) { //TO CHANGE VOTE FROM YAY TO NAY AND VICE VERSA
            collection.update({_id: user._id, "votes.bill_id": billId}, {$set: {"votes.$.vote": vote}}, function(err, records) {
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

                        var promise = callSunlight(options);
                        promise.then(function(data) {
                            if (data.count > 0) {
                                var senatorId = Object.keys(data.results[0].voters)[0]; //TO RETRIEVE KEY NAME FROM THE JSON BODY
                                if (data.results[0].voters[senatorId]) {
                                    if ((vote === true && data.results[0].voters[senatorId].vote != "Yea") ||
                                            (vote === false && data.results[0].voters[senatorId].vote === "Yea")) {
                                        console.log("recording disagreement for " + senatorId);
                                        collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                            if (err) {
                                                console.log("Disagreement failed with  " + err);
                                            } else {
                                                console.log("successfully recorded disagreement");

                                            }
                                        });
                                    } else {
                                        collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": -1}}, function(err, records) {
                                            if (err) {
                                                console.log("Agreement failed with  " + err);
                                            } else {
                                                console.log("successfully recorded agreement");

                                            }
                                        });
                                    }
                                }
                            }

                        }, function(error) {
                            console.log("promise rejected with " + error);
                        });
                    }
                    return res.send("Vote for the bill successfull");
                }
            });
        }else{ //TO REMOVE IGNORED VOTE FROM THE VOTE LIST AND UPDATE DISAGREEMENT . I.E DECREMENT
            collection.update({_id: user._id}, {$pull : {"votes" : {"bill_id" : billId } } }, function(err, records) {
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

                        var promise = callSunlight(options);
                        promise.then(function(data) {
                            if (data.count > 0) {
                                var senatorId = Object.keys(data.results[0].voters)[0]; //TO RETRIEVE KEY NAME FROM THE JSON BODY
                                if (data.results[0].voters[senatorId]) {
                                    
                                        collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": -1}}, function(err, records) {
                                            if (err) {
                                                console.log("Agreement failed with  " + err);
                                            } else {
                                                console.log("successfully removed disagreement");

                                            }
                                        });
                                    }
                            }

                        }, function(error) {
                            console.log("promise rejected with " + error);
                        });
                    }
                    return res.send("Vote for the bill successfull");
                }
            });
        }
    });

});


//GET ALL THE BILLS
app.get('/user/bills', requireAuth(), function(req, res) {
    var apikey = config.sunlight_apikey;
    var user = req.params.user;
    var billCount = 0;
    var timelineObjects = [];
    if (user.votes.length > 0) {
        
        for (var i in user.votes) {
            var bill = user.votes[i];
            var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?bill_id=' + bill.bill_id + '&fields=bill_id,official_title,short_title',
                method: 'GET',
                headers: {'x-apikey': apikey }
            };

            var promise = callSunlightAndStoreVote(options ,bill.vote );
            promise.then(function(info) {
                timelineObjects.push({"bill" : info.data.results[0] , "vote" : info.vote});
                
                if(timelineObjects.length === user.votes.length)
                    return res.status(200).send(timelineObjects);

            }, function(error) {
                    console.log("promise rejected with " + error);
            });
        }
    }
    else
        return res.status(200).send('Voted on no bills');
});


//CALCULATE REP WORTHINESS
app.get('/user/reps', requireAuth() , function(req, res) {
    var user = req.params.user;
    if(user.votes)
        var totalVoteCount = user.votes.length ;
    else
        var totalVoteCount = 0;
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


app.post('/user/reps' , requireAuth() , function(req,res){
    
    var user = req.params.user;
    var reps = user.senators;
    var repArray = req.body;
    var senatorObjects = [];
    for (var i in repArray) {
        for (var j in reps) {
            if (repArray[i] === reps[j]["id"]) {
                return res.status(400).send("Rep "+reps[j]["id"]+" already saved ");
            }
        }
    }
    for(var i in repArray) {
        senatorObjects.push({"id" : repArray[i] , "disagree" : 0});
    }
    
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');

        collection.update({"_id" : user._id}, {$pushAll : {"senators" : senatorObjects} } , function(err, records) {
            if (err) {
                return res.status(400).send("User already exists");
            }
            calculateDisagreementsForNewlyAddedSenators(user._id , senatorObjects , user.votes);
            console.log("Record added");
            return res.send("Reps added");
        });

    });
    
});

app.delete('/user/reps/:repId', requireAuth(), function(req, res) {

    var user = req.params.user;
    var repId = req.param('repId');

    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');

        collection.update({"_id": user._id}, {$pull: {"senators": {"id": repId}}}, function(err, records) {
            if (err) {
                return res.status(400).send("rep id "+repId+" does not exist");
            }
            return res.send("Rep " + repId + " deleted");
        });
    });

});

app.get('/zipcode/:zipcode/reps' , function(req,res){
    
    var zipcode = req.param('zipcode');
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/legislators/locate/?fields=govtrack_id,bioguide_id,chamber,first_name,middle_name,state,phone,last_name&zip='+zipcode,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var legislators = http.request(options, function( response) {
                response.on('data', function (data) {
                        data = JSON.parse(data);
                        
                        return res.status(200).send(data.results);
                });
                response.on('error', function (e) {
                        console.log(e);
                        return  res.status(400).send(e);
                });
    });
                        
    legislators.write("");
    legislators.end();

});




app.get('/user/test', function(req, res) {  //TESTING PROMISES
    
    
    var billId = 'hres475-113';
    var senators = [ "A000022", "A000210", "B001234" ];
    for (var i in senators) {
        var senator = senators[i];
        
        var options = {
            host: 'congress.api.sunlightfoundation.com',
            path: '/votes?voter_ids.' + senator + '__exists=true&vote_type=passage&bill_id=' + billId + '&fields=voters.' + senator + '.vote',
            method: 'GET',
            headers: {'x-apikey': apikey}
        };

        var promise = callSunlight(options);
        promise.then(function (data){
            if(data.count > 0){
                console.log(data.results[0].voters); 
                var senatorId = Object.keys(data.results[0].voters)[0];
                console.log(data.results[0].voters[senatorId].vote);
                
            }
        },function(error){
            console.log("promise rejected with "+error);
        });
    }
    return res.send("Vote for the bill successfull");

});


function callSunlight(options) {
    var promise = new Promise(function(resolve, reject) {
        var callVote = http.request(options, function(response) {

            response.on('data', function(data) {
                data = JSON.parse(data);
                resolve(data);
            });
            response.on('error', function(e) {
                console.log(e);
                reject(err);
            });
        });
        callVote.write("");
        callVote.end();
    });

    return promise;
}

app.post('/user/legislators' , function(req,res){
    var jsonBody = req.body;
    if(jsonBody.streetAddress && jsonBody.zipcode){
        
        var options = {
                host: 'maps.googleapis.com',
                path : '/maps/api/geocode/json?address='+jsonBody.streetAddress+'&components=postal_code:'+jsonBody.zipcode+'&sensor=false',
                method: 'GET',
                headers: {'key': 'AIzaSyDIvQ3yOOChwaZNj6pAh9puIOS7ukmGi0A' }
        };
        var googleLatLong = http.request(options, function( response) {
            var result = '';
                response.on('data', function (chunk) {
                        result += chunk;
                        
                });
                response.on('end' , function(){
                    var data = JSON.parse(result);
                    var lat = data.results[0].geometry.location.lat;
                    var long = data.results[0].geometry.location.lng;
                    
                    if (lat && long){
                        var options = {
                                    host: 'congress.api.sunlightfoundation.com',
                                    path: '/legislators/locate/?latitude='+lat+'&longitude='+long,
                                    method: 'GET',
                                    headers: {'x-apikey': apikey }
                        };

                        var legislators = http.request(options, function( response) {
                            var result ='';
                                    response.on('data', function (chunk) {
                                            result += chunk;
                                    });
                                    response.on('end', function () {
                                            var data = JSON.parse(result);
                                            return res.status(200).send(data);
                                    });
                                    response.on('error', function (e) {
                                            console.log(e);
                                            return  res.status(400).send(e);
                                    });
                        });

                        legislators.write("");
                        legislators.end();
                        
                        
                    }else{
                        return res.status(400).send('lat/lng not found');
                    }
                        
                    
                    
                    
                });
                response.on('error', function (e) {
                        console.log(e);
                        return  res.status(400).send(e);
                });
        });
                        
    googleLatLong.write("");
    googleLatLong.end();
    }else{
        return res.status(400).send('missing zipcode and streetAddress');
    }
    

});

app.get('/bills/search', function(req, res) {  //TESTING PROMISES
    
    var billSearch = req.query.bill;
    
    if(! billSearch)
        return res.status(400).send('missing bill search text');
    var limit = req.query.per_page ;
    if(!limit)
        limit = 5;
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?congress=113&query="'+encodeURIComponent(billSearch)+'"&history.enacted=true&per_page='+limit,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bills = http.request(options, function( response) {
                response.on('data', function (data) {
                        data = JSON.parse(data);
                        
                        return res.status(200).send(data.results);
                });
                response.on('error', function (e) {
                        console.log(e);
                        return  res.status(400).send(e);
                });
    });
                        
    bills.write("");
    bills.end();

});


function calculateDisagreementsForNewlyAddedSenators(userId , senators , votedBills){
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
    for (var i in senators){
        var senator = senators[i];
        
        for (var j in votedBills){
            var bill = votedBills[j];
            
            var options = {
                            host: 'congress.api.sunlightfoundation.com',
                            path: '/votes?voter_ids.' + senator.id + '__exists=true&vote_type=passage&bill_id=' + bill.bill_id + '&fields=voters.' + senator.id + '.vote',
                            method: 'GET',
                            headers: {'x-apikey': apikey}
            };
            
            var promise = callSunlightAndStoreVote(options , bill.vote);
                    promise.then(function(result) {
                        var data = result.data;
                        var vote = result.vote;
                        if (data.count > 0) {
                            var senatorId = Object.keys(data.results[0].voters)[0]; //TO RETRIEVE KEY NAME FROM THE JSON BODY
                            if (data.results[0].voters[senatorId]) {
                                if ((vote === true && data.results[0].voters[senatorId].vote != "Yea") ||
                                        (vote === false && data.results[0].voters[senatorId].vote === "Yea")) {
                                    console.log("recording disagreement for " + senatorId);
                                    collection.update({_id: userId, "senators.id": senatorId}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                        if (err) {
                                            console.log("Disagreement failed with  " + err);
                                        } else {
                                            console.log("successfully recorded disagreement");

                                        }
                                    });
                                }
                            }
                        }

                    }, function(error) {
                        console.log("promise rejected with " + error);
                });
            
        }
    }
    });
};


function callSunlightAndStoreVote(options , vote) {
    var promise = new Promise(function(resolve, reject) {
        var callVote = http.request(options, function(response) {

            response.on('data', function(data) {
                data = JSON.parse(data);
                
                resolve({"data" : data , "vote" : vote});
            });
            response.on('error', function(e) {
                console.log(e);
                reject(err);
            });
        });
        callVote.write("");
        callVote.end();
    });

    return promise;
}