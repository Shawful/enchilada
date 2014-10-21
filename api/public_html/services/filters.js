var dbConnection = require('../services/dbconnector');
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;

exports.saveFilters = function() {
    return function(req, res) {
    var user = req.params.user;
    var jsonBody = req.body;
    
    var db = dbConnection.getDbConnection();
        if(!db)
            return res.status(500).send("Failed to initialize the db.");

        var collection = db.collection('authentications');
            collection.update({_id : user._id} ,{$set:{"filters" : jsonBody}}, function(err, records) {
            if (err) {
                return res.status(400).send("failed to record vote");
            }
            return res.send("filters saved");
            });
        
    };
};

exports.getUserFilters = function() {
    return function(req, res) {
    var user = req.params.user;
    if(user.filters){
        return res.status(200).send(user.filters);
    }
    else
        return res.status(404).send("No filters found.");
    };
};



