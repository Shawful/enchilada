var Promise = require('promise');
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
var http = require('https');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;
var async = require('async');

exports.getUserVotedBills = function() {
    return function(req, res) {

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
                    headers: {'x-apikey': apikey}
                };

                var promise = callSunlightAndStoreVote(options, bill.vote);
                promise.then(function(info) {
                    timelineObjects.push({"bill": info.data.results[0], "vote": info.vote});

                    if (timelineObjects.length === user.votes.length)
                        return res.status(200).send(timelineObjects);

                }, function(error) {
                    console.log("promise rejected with " + error);
                });
            }
        }
        else
            return res.status(200).send('Voted on no bills');
    };
};

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

function callSunlightAndStoreVote(options, vote) {
    var promise = new Promise(function(resolve, reject) {
        var callVote = http.request(options, function(response) {

            response.on('data', function(data) {
                data = JSON.parse(data);

                resolve({"data": data, "vote": vote});
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



exports.voteOnABillExperiment = function() {
    return function(req, res) {
        var user = req.params.user;
        var vote = req.param('vote');
        var billId = req.param('billId');
        var senators = user.senators;
        if (!vote) {
            return res.status(400).send("vote missing");
        }
        console.log(vote);
        if (vote === '1')
            vote = true;
        else
            vote = false;

        var originalBillVote = null;
        var flagToRecast = false;
        var userVotes = user.votes;
        for (var iter in userVotes) {
            //check if the bill has been voted earlier from the vote historu
            if (billId === userVotes[iter]["bill_id"]) {
                flagToRecast = true;
                originalBillVote = userVotes[iter]["vote"];
                console.log("current vote : " + vote);
                console.log("historical vote : " + originalBillVote);

                if (originalBillVote === vote)  //removing the possibility of recasting votes
                    return res.status(200).send("No change in vote position");
                break;
            }
        }

        if (flagToRecast) { //for a different vote than current vote .. USER CHANGING VOTE ON A BILL
            console.log("modifying the vote postion");
            MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
                var collection = db.collection('authentications');
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
                                        if ((vote === true && data.results[0].voters[senatorId].vote !== "Yea") ||
                                                (vote === false && data.results[0].voters[senatorId].vote === "Yea")) {  // recording disagreement
                                            console.log("recording disagreement for " + senatorId);
                                            collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                                if (err) {
                                                    console.log("Disagreement failed with  " + err);
                                                } else {
                                                    console.log("successfully recorded disagreement");

                                                }
                                            });
                                        } else {
                                            console.log("recording agreement for " + senatorId);
                                            collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.disagree": -1}}, function(err, records) {
                                                if (err) {
                                                    console.log("Agreement failed with  " + err);
                                                } else {
                                                    console.log("successfully recorded agreement");

                                                }
                                            });
                                        }
                                    }
                                } else {
                                    console.log("recording novote");
                                    collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.novote": 1}}, function(err, records) {
                                        if (err) {
                                            console.log("Disagreement failed with  " + err);
                                        } else {
                                            console.log("successfully recorded novote " + records);

                                        }
                                    });
                                }

                            }, function(error) {
                                console.log("promise rejected with " + error);
                            });
                        }
                        return res.send("Vote for the bill successfull");
                    }
                });
            });



        } else { ///RECORDING A NEW BILL VOTE FOR THE USER
            console.log("recording the new vote postion");
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

                                        if ((vote === true && data.results[0].voters[senatorId].vote !== "Yea") ||
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
                                } else {
                                    console.log('recording novote');
                                    console.log(senatorId);
                                    collection.update({_id: user._id, "senators.id": senatorId}, {$inc: {"senators.$.novote": 1}}, function(err, records) {
                                        if (err) {
                                            console.log("Disagreement failed with  " + err);
                                        } else {
                                            console.log("successfully recorded novote " + records);

                                        }
                                    });
                                }

                            }, function(error) {
                                console.log("promise rejected with " + error);
                            });

                        }
                        return res.send("Vote for the bill successfull");
                    }
                });
            });
        }
    }
    ;
};




exports.clearBills = function() {
    return function(req, res) {
        var user = req.params.user;
        var reps = user.senators;
        if (reps) {
            for (var i in reps) {
                reps[i].disagree = 0;
                reps[i].novote = 0;
            }
        }
        MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
            if (err)
                throw err;

            var collection = db.collection('authentications');
            collection.update({_id: user._id}, {$set: {"votes": [], "senators": reps}}, function(err, records) {
                if (err) {
                    return res.status(400).send("failed to record vote");
                }

                return res.send("bills reset");
            });
        });
    };
};



exports.voteOnABillExperimentAsync = function() {
    return function(req, res) {
        var user = req.params.user;
        var vote = req.param('vote');
        var billId = req.param('billId');
        var senators = user.senators;
        if (!vote) {
            return res.status(400).send("vote missing");
        }
        console.log(vote);
        if (vote === '1')
            vote = true;
        else
            vote = false;

        var originalBillVote = null;
        var flagToRecast = false;
        var userVotes = user.votes;
        for (var iter in userVotes) {
            if (billId === userVotes[iter]["bill_id"]) {
                flagToRecast = true;
                originalBillVote = userVotes[iter]["vote"];
                if (originalBillVote === vote)  //removing the possibility of recasting votes
                    return res.status(200).send("No change in vote position");
                break;
            }
        }

        if (flagToRecast) { //changing the vote
            console.log("modifying the vote postion");
            MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
                var collection = db.collection('authentications');
                collection.update({_id: user._id, "votes.bill_id": billId}, {$set: {"votes.$.vote": vote}}, function(err, records) {
                    if (err) {
                        console.log(err);
                        return res.status(400).send("failed to record vote");
                    }

                    async.eachSeries(senators,
                            function(senator, callback) {
                                var options = {
                                    host: 'congress.api.sunlightfoundation.com',
                                    path: '/votes?voter_ids.' + senator.id + '__exists=true&vote_type=passage&bill_id=' + billId + '&fields=voters.' + senator.id + '.vote&order=voted_at',
                                    method: 'GET',
                                    headers: {'x-apikey': apikey}
                                };

                                var rep = http.request(options, function(response) {
                                    var result = '';
                                    response.on('data', function(chunk) {
                                        result += chunk;
                                    });
                                    response.on('end', function() {
                                        var data = JSON.parse(result);
                                        if (data.count > 0) {

                                            if (data.results[0].voters[senator.id]) {
                                                
                                                if ((vote === true && data.results[0].voters[senator.id].vote !== "Yea") ||
                                                    (vote === false && data.results[0].voters[senator.id].vote === "Yea")
                                                    ) {  // recording disagreement
                                                      console.log(data.results[0].voters[senator.id].vote);      
                                                    collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                                        if (err) {
                                                            console.log("Disagreement failed with  " + err);
                                                        } else {
                                                            console.log("successfully recorded disagreement for " + senator.id + " on bill " + billId);

                                                        }
                                                    });
                                                } else if(((vote === true && data.results[0].voters[senator.id].vote === "Yea") ||
                                                        (vote === false && data.results[0].voters[senator.id].vote === "Nay"))   ) {
                                                    collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.disagree": -1}}, function(err, records) {
                                                        if (err) {
                                                            console.log("Agreement failed with  " + err);
                                                        } else {
                                                            console.log("successfully recorded agreement for " + senator.id + " on bill " + billId);

                                                        }
                                                    });
                                                }
                                            } else {
                                                collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.novote": 1}}, function(err, records) {
                                                    if (err) {
                                                        console.log("Disagreement failed with  " + err);
                                                    } else {
                                                        console.log("successfully recorded novote " + records);

                                                    }
                                                });
                                            }
                                        }
                                        callback();
                                    });
                                    response.on('error', function(e) {
                                        console.log('failed with ' + error);
                                        callback(err, null);
                                    });
                                });
                                rep.write("");
                                rep.end();
                            },
                            function(err) {
                                if (err)
                                    return res.status(400).send(err);
                                return res.status(200).send("Vote saved");
                            }
                    );
                });
            });

        } else {
            console.log("Saving a new bill vote");
            MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
                var collection = db.collection('authentications');
                collection.update({_id: user._id}, {$addToSet: {votes: {"bill_id": billId, "vote": vote}}}, function(err, records) {
                    if (err) {
                        console.log(err);
                        return res.status(400).send("failed to record vote");
                    }

                    async.eachSeries(senators,
                            function(senator, callback) {
                                var options = {
                                    host: 'congress.api.sunlightfoundation.com',
                                    path: '/votes?voter_ids.' + senator.id + '__exists=true&vote_type=passage&bill_id=' + billId + '&fields=voters.' + senator.id + '.vote&order=voted_at',
                                    method: 'GET',
                                    headers: {'x-apikey': apikey}
                                };

                                var rep = http.request(options, function(response) {
                                    var result = '';
                                    response.on('data', function(chunk) {
                                        result += chunk;
                                    });
                                    response.on('end', function() {
                                        var data = JSON.parse(result);
                                        if (data.count > 0) {

                                            if (data.results[0].voters[senator.id]) {
                                                if ((vote === true && data.results[0].voters[senator.id].vote !== "Yea") ||
                                                        (vote === false && data.results[0].voters[senator.id].vote === "Yea") ||
                                                    (data.results[0].voters[senator.id].vote === "Present") ||
                                                    (data.results[0].voters[senator.id].vote === "Not Voting") ) {  // recording disagreement

                                                    collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                                        if (err) {
                                                            console.log("Disagreement failed with  " + err);
                                                        } else {
                                                            console.log("successfully recorded disagreement for " + senator.id + " on bill " + billId);

                                                        }
                                                    });
                                                } 
//                                                
                                            }
                                        } else {
                                            collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.novote": 1}}, function(err, records) {
                                                if (err) {
                                                    console.log("Disagreement failed with  " + err);
                                                } else {
                                                    console.log("successfully recorded novote " + records);

                                                }
                                            });
                                        }
                                        callback();
                                    });
                                    response.on('error', function(e) {
                                        console.log('failed with ' + error);
                                        callback(err, null);
                                    });
                                });
                                rep.write("");
                                rep.end();
                            },
                            function(err) {
                                if (err)
                                    return res.status(400).send(err);
                                return res.status(200).send("Vote saved");
                            }
                    );
                });
            });
        }
    };
};