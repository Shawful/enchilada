var MongoClient = require('mongodb').MongoClient;

exports.getUserZipCode = function() {
    return function(req, res) {
        var user = req.params.user;
    if(user.zipcode){
        return res.status(200).send({"zipcode" : user.zipcode});
    }
    else
        return res.status(404).send("Zipcode not found for user");
    };
};

exports.saveZipCodeForUser = function() {
    return function(req, res) {
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
    };
};

exports.findRepsByZipCode = function() {
    return function(req, res) {
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
    };
};