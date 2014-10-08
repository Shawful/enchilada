var MongoClient = require('mongodb').MongoClient;
var http = require('https');
var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;


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
    
    var zipcode = req.param('zipcode');
    
     var options = {
                                    host: 'congress.api.sunlightfoundation.com',
                                    path: '/legislators/locate/?fields=bioguide_id,chamber,first_name,middle_name,state,phone,last_name&zip='+zipcode,
                                    method: 'GET',
                                    headers: {'x-apikey': apikey}
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
                
    };
};


exports.findViewportCoordinatesForZipcode = function() {
    return function(req, res) {
     var zipcode = req.param('zipcode');
     if(!zipcode)
         return  res.status(400).send('zipcode not found');
     var options = {
                host: 'maps.googleapis.com',
                path : '/maps/api/geocode/json?address='+zipcode,
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
                    var viewport = data.results[0].geometry.viewport;
                    return  res.status(200).send(viewport);
                });
                response.on('error', function (e) {
                        console.log(e);
                        return  res.status(400).send(e);
                });
        });
                        
    googleLatLong.write("");
    googleLatLong.end();
    };
};