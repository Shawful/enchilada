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
var filterService = require('./services/filters');


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
app.post('/user/bills/:billId/:vote', requireAuth(), userBillService.voteOnABillExperiment(MongoClient));



//GET ALL THE BILLS
app.get('/user/bills', requireAuth(), userBillService.getUserVotedBills());


//CALCULATE REP WORTHINESS
app.get('/user/reps', requireAuth(), repService.getUserReps());

//SAVE ZIPCODE BASED REPS  Req body : ["asdasd","adasdas"]
app.put('/user/reps', requireAuth(), repService.saveARep(MongoClient));

app.post('/user/reps', requireAuth(), repService.addReps(MongoClient));

app.delete('/user/reps/:repId', requireAuth(), repService.deleteARep(MongoClient));

app.get('/zipcode/:zipcode/reps', zipCodeService.findRepsByZipCode());

app.get('/zipcode/:zipcode/viewport', zipCodeService.findViewportCoordinatesForZipcode());

app.post('/user/legislators', repService.findRepsByLatLong());

app.get('/bills/search', billService.searchBills());

app.post('/user/filters', requireAuth(), filterService.saveFilters());

app.get('/user/filters', requireAuth(), filterService.getUserFilters() );


