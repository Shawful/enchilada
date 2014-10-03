var sha1 = require('sha1');

exports.createNewAccount = function(MongoClient) {
    return function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');


        var jsonBody = req.body;
        
        if(jsonBody){
        if(!jsonBody.password)    
            return res.status(400).send("Password is required");
        
        jsonBody.password = sha1(jsonBody.password);
        
        collection.insert(jsonBody, {safe: true}, function(err, records) {
            if (err) {
                return res.status(400).send("User already exists");
            }
            console.log("Record added as " + records[0]._id);
            return res.send("User added");
        });
        }else
            return res.status(400).send("Bad data");

    });
    };
};

exports.login = function(MongoClient) {
    return function(req, res) {
        var username  = req.headers['x-username'];
    var password  = req.headers['x-password'];
    if(username == null || password == null){
        res.status(400).send("Username and password required");
    }
    MongoClient.connect('mongodb://127.0.0.1:27017/users', function(err, db) {
        if (err)
            throw err;

        var collection = db.collection('authentications');
        
        
        password = sha1(password);
        
        
        
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
    };
};