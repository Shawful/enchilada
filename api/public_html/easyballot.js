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


var repService = require('./services/reps');
var zipCodeService = require('./services/zipcode');
var userService = require('./services/userauth');
var userBillService = require('./services/userbills');
var billService = require('./services/bills');

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
                        collection.findOne({_id: token.user_id}, function(err, user) {
                            if (err) {
                                return res.status(401).send("Unauthorized");
                            }

                            req.params.user = user;
                            next();
                        });
                    } else
                        return res.status(403).send("Unauthorized token.");

                });

            });
        }
        else
            return res.status(403).send("no x-auth");

    }
}

app.get('/', function(req, res) {
    console.log(__dirname);
    res.sendfile(__dirname + '/index.html');
    //return res.send("hello")
});

app.post('/user', userService.createNewAccount(MongoClient));

app.post('/user/login', userService.login(MongoClient));

//SAVE USER ZIP CODE
app.put('/user/zipcode/:zipcode', requireAuth(), zipCodeService.saveZipCodeForUser(MongoClient));

//GETS THE SAVED ZIPCODE
app.get('/user/zipcode', requireAuth(), zipCodeService.getUserZipCode());



// USER VOTE FOR A BILL ID ... HAS A BUG WHEN TRYING TO VOTE ON SAME BILL
app.post('/user/bills/:billId/:vote', requireAuth(), userBillService.voteOnABill(MongoClient));


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
        } else { //TO REMOVE IGNORED VOTE FROM THE VOTE LIST AND UPDATE DISAGREEMENT . I.E DECREMENT
            collection.update({_id: user._id}, {$pull: {"votes": {"bill_id": billId}}}, function(err, records) {
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
app.get('/user/bills', requireAuth(), userBillService.getUserVotedBills());


//CALCULATE REP WORTHINESS
app.get('/user/reps', requireAuth(), repService.getUserReps());

//SAVE ZIPCODE BASED REPS  Req body : ["asdasd","adasdas"]
app.put('/user/reps', requireAuth(), repService.saveARep(MongoClient));

app.post('/user/reps', requireAuth(), repService.addReps(MongoClient));

app.delete('/user/reps/:repId', requireAuth(), repService.deleteARep(MongoClient));

app.get('/zipcode/:zipcode/reps', zipCodeService.findRepsByZipCode());

app.post('/user/legislators', repService.findRepsByLatLong());

app.get('/bills/search', billService.searchBills());
