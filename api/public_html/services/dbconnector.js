var MongoClient = require('mongodb').MongoClient;
var db;
var dbName = "users";
var server = "127.0.0.1";

exports.init = function(){
    console.log('Initialising DB ...');
    if(!db){
        MongoClient.connect("mongodb://"+server+":27017/"+dbName, function(err, database) {
            if(err) throw err;
            
            db = database;
            console.log('DB setup complete.');
        });
    }
};

exports.getDbConnection = function(){
    return db;
};