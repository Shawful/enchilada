var MongoClient = require('mongodb').MongoClient;
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
var http = require('https');
var Promise = require('promise');
var async = require('async');


exports.saveARep = function() {
    return function(req, res) {
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
    };
};


exports.getUserReps = function() {
    return function(req, res) {
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
    };
};


exports.addReps = function() {
    return function(req, res) {
    var user = req.params.user;
    var reps = user.senators;
    var repArray = req.body;
    if(repArray.length > 3 ||  repArray.length < 3)
        return res.status(400).send('invalid number of reps');
    var senatorObjects = [];
    
    for(var i in repArray) {
        senatorObjects.push({"id" : repArray[i] , "disagree" : 0});
    }
    
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        collection.update({"_id" : user._id}, {$set : {"senators" : [] } } , function(err, records) {
            if(err){
                console.log("clearing reps failed with "+err);
                 return res.status(500).send('Internal server error');  
            }
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
    };
};


exports.deleteARep = function() {
    return function(req, res) {
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
    };
};

exports.findRepsByLatLong = function() {
    return function(req, res) {
        var jsonBody = req.body;
    if(jsonBody.streetAddress && jsonBody.zipcode){
        
        var options = {
                host: 'maps.googleapis.com',
                path : '/maps/api/geocode/json?address='+encodeURIComponent(jsonBody.streetAddress)+'&components=postal_code:'+jsonBody.zipcode+'&sensor=false',
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
    };
};

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


exports.getUserRepsAsync = function() {
    return function(req, res) {
    var user = req.params.user;
    if(user.votes)
        var totalVoteCount = user.votes.length ;
    else
        var totalVoteCount = 0;
    var senators = user.senators;
    
    var repWorthiness = [];
    
    
        async.eachSeries(senators,
                
                        function(senator, callback) {
                            var options = {
                            host: 'congress.api.sunlightfoundation.com',
                            path: '/legislators?bioguide_id='+senator.id,
                            method: 'GET',
                            headers: {'x-apikey': apikey}
                            };
                            console.log('processing '+senator.id);
                            
                            var rep = http.request(options, function(response) {
                                var result ='';
                                    response.on('data', function (chunk) {
                                            result += chunk;
                                });
                                response.on('end', function() {
                                    result = JSON.parse(result);
                                    if(result.results.length >0){
                                    //repWorthiness.push({"first_name" : result.results[0].first_name});
                                    if(totalVoteCount ==0)
                                        var worthiness = 100;
                                    else
                                        var worthiness = ((totalVoteCount -senator.disagree)/totalVoteCount)*100;
                                    repWorthiness.push({"first_name" : result.results[0].first_name , "last_name" : result.results[0].last_name , "bioguide_id" : senator.id ,"worthiness" : worthiness });                                    
                                    callback();
                                    }
                                });
                                response.on('error', function(e) {
                                    console.log('failed with '+error);
                                        callback(err,null);
                                    });
                                });
                                rep.write("");
                                rep.end();
                        },
                         function(err) {
                             if(err)
                                 return res.status(400).send(err);
                             return res.status(200).send(repWorthiness);
                         }
                    );

    };
};