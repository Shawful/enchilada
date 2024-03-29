var Promise = require('promise');
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
var http = require('https');
var dbConnection = require('../services/dbconnector');
var async = require('async');

exports.getUserVotedBills = function() {
    return function(req, res) {
        
        var apikey = config.sunlight_apikey;
        var user = req.params.user;
        var billCount = 0;
        var limit = req.query.per_page;
        var page = req.query.page;
        if(!page || page < 0)
            page =1;
        if(!limit || limit < 0)
            limit = 5;
        if(limit > 10)
            limit =10;
        var finalResult = new Object();
        var timelineObjects = [];
        if (user.votes.length > 0) {
        billCount = user.votes.length;
        finalResult.count = billCount;    
            
        var startIndex = (page - 1 )* limit;
        var slicedArray = user.votes.slice(startIndex , limit*page);
            if(slicedArray.length === 0)
                return res.status(200).send(slicedArray);
            
            async.eachSeries(slicedArray, function(bill, callback) {
                var options = {
                    host: 'congress.api.sunlightfoundation.com',
                    path: '/bills/search?bill_id=' + bill.bill_id + '&fields=bill_id,official_title,short_title',
                    method: 'GET',
                    headers: {'x-apikey': apikey}
                };
                var callVote = http.request(options, function(response) {
                    var result ='';
                        response.on('data', function (chunk) {
                                result += chunk;
                        });
                        response.on('end', function () {
                               var data = JSON.parse(result);
                               if(data.count > 0 ) {
                                //CALCULATING THE SENATOR VOTES FOR EACH SENATOR
                                var senatorVotes = [];
                                async.eachSeries(user.senators , function(senator , callback2){
                                    var options = {
                                        host: 'congress.api.sunlightfoundation.com',
                                        path: '/votes?voter_ids.' + senator.id + '__exists=true&vote_type=passage&bill_id=' + bill.bill_id + '&fields=voters.' + senator.id + '.vote&order=voted_at',
                                        method: 'GET',
                                        headers: {'x-apikey': apikey}
                                    };
                                    var rep = http.request(options, function(response) {
                                        var result = '';
                                        response.on('data', function(chunk) {
                                            result += chunk;
                                        });
                                        response.on('end', function() {
                                            var senatorVote = JSON.parse(result);
                                            
                                            if (senatorVote.count > 0) {
//                                                console.log('senator : '+senator.id+' is '+senatorVote.results[0].voters[senator.id].vote);
                                                if (senatorVote.results[0].voters[senator.id]) {
                                                    senatorVotes.push({"senator" : senator.id , "vote" :senatorVote.results[0].voters[senator.id].vote });
                                                }
                                            }else{
                                                senatorVotes.push({"senator" : senator.id , "vote" :"-" });
                                            }
                                            callback2();
                                            
                                        });
                                        response.on('error', function (e) {
                                                console.log(e);
                                                callback2(e);
                                        });
                                    });
                                    rep.write("");
                                    rep.end();
                                },function(err) {
                                    
                                        if (err)
                                            return res.status(400).send(err);
                                        timelineObjects.push({"bill": data.results[0], "uservote": bill.vote, "voted_at" : bill.voted_at , 
                                                    "senatorVotes" : senatorVotes} );
                                        callback();
                                });
                            
                        }
                        });
                        response.on('error', function (e) {
                                console.log(e);
                                callback(e);
                        });
                        });
                callVote.write("");
                callVote.end();
                
            },
                    function(err) {
                        if (err)
                            return res.status(400).send(err);
                        finalResult.bills = timelineObjects;
                        finalResult.count = billCount ;
                        return res.status(200).send(finalResult);
                    }
            );
            
            
        }else{
            finalResult.bills = timelineObjects;
            finalResult.count = 0;
            return res.status(200).send(finalResult);
        }
    };
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
        var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");

            var collection = db.collection('authentications');
            collection.update({_id: user._id}, {$set: {"votes": [], "senators": reps}}, function(err, records) {
                if (err) {
                    return res.status(400).send("failed to record vote");
                }

                return res.send("bills reset");
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
        var currentTime = new Date();
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
            var db = dbConnection.getDbConnection();
            if(!db)
                return res.status(500).send("Failed to initialize the db.");
                var collection = db.collection('authentications');
                collection.update({_id: user._id, "votes.bill_id": billId}, {$set: {"votes.$.vote": vote ,"votes.$.voted_at": currentTime }}, function(err, records) {
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
                                                
                                                if ((vote === true && data.results[0].voters[senator.id].vote === "Nay") ||
                                                    (vote === false && data.results[0].voters[senator.id].vote === "Yea")
                                                    ) {  // recording disagreement
                                                       collection.update({_id: user._id, "senators.id": senator.id}, {$inc: {"senators.$.disagree": 1}}, function(err, records) {
                                                        if (err) {
                                                            console.log("Disagreement failed with  " + err);
                                                        } else {
                                                            console.log("successfully recorded disagreement for " + senator.id + " on bill " + billId);

                                                        }
                                                    });
                                                } else if(((vote === true && data.results[0].voters[senator.id].vote === "Yea") ||
                                                        (vote === false && data.results[0].voters[senator.id].vote === "Nay"))   ) {
                                                    if( ! (senator.disagree === 0) )
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
            

        } else {
            console.log("Saving a new bill vote");
            var db = dbConnection.getDbConnection();
            if(!db)
                return res.status(500).send("Failed to initialize the db.");
                var collection = db.collection('authentications');
                collection.update({_id: user._id}, {$addToSet: {votes: {"bill_id": billId, "vote": vote ,"voted_at": currentTime}}}, function(err, records) {
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
            
        }
    };
};


exports.getUserBillCount = function() {
    return function(req, res) {
        var user = req.params.user;
        
        if(user.votes)
            return res.status(200).send({"count" : user.votes.length});
        else
            return res.status(200).send({"count" : 0});
    };
};