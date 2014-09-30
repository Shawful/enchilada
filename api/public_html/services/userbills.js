var Promise = require('promise');
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
var http = require('https');

exports.voteOnABill = function(MongoClient) {
    return function(req, res) {
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
    };
};

exports.getUserVotedBills = function(MongoClient) {
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