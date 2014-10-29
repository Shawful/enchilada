var express = require('express');
var cors = require('cors');
var app = express();


////var fs = require('fs');
//var sslOptions = {
//  key: fs.readFileSync('/opt/apps/certs/eb-ssl-key.pem'),
//  cert: fs.readFileSync('/opt/apps/certs/easyballot.crt'),
//  ca: fs.readFileSync('/opt/apps/certs/gd_bundle-g2-g1.crt'),
//  requestCert: true,
//  rejectUnauthorized: false
//};

var server = require('http').createServer(app);


var http = require('https');
var path = require('path');


app.use(cors());

server.listen(3000);

var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/public')));
app.use(app.router);

var dbConnection = require('./services/dbconnector');
dbConnection.init();

var repService = require('./services/reps');
var zipCodeService = require('./services/zipcode');
var userService = require('./services/userauth');
var userBillService = require('./services/userbills');
var billService = require('./services/bills');
var filterService = require('./services/filters');
var emailService = require('./services/email');
var contactService = require('./services/contact');


function requireAuth() {
    return function(req, res, next) {
        if (req.headers['x-auth'] != null) {
            var authtoken = req.headers['x-auth'];
            
            
                var db = dbConnection.getDbConnection();
                if(!db)
                    return res.status(500).send("Failed to initialize the db.");
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

            
        }
        else
            return res.status(403).send("no x-auth");

    };
}

app.get('/', function(req, res) {
    console.log(__dirname);
    res.sendfile(__dirname + '/index.html');
    //return res.send("hello")
});

app.post('/user', userService.createNewAccount());

app.post('/user/login', userService.login());

app.post('/user/verify/:code', userService.verify());

app.get('/user/profile' , requireAuth() , userService.getUserProfile());

app.put('/user/profile' , requireAuth() , userService.changeUserProfile());

//SAVE USER ZIP CODE
app.put('/user/zipcode/:zipcode', requireAuth(), zipCodeService.saveZipCodeForUser());

//GETS THE SAVED ZIPCODE
app.get('/user/zipcode', requireAuth(), zipCodeService.getUserZipCode());



// USER VOTE FOR A BILL ID ... HAS A BUG WHEN TRYING TO VOTE ON SAME BILL
app.post('/user/bills/:billId/:vote', requireAuth(), userBillService.voteOnABillExperimentAsync());



//GET ALL THE BILLS
app.get('/user/bills', requireAuth(), userBillService.getUserVotedBills());

//GET ALL THE BILLS
app.get('/user/bills/count', requireAuth(), userBillService.getUserBillCount());


//CALCULATE REP WORTHINESS
app.get('/user/reps', requireAuth(), repService.getUserRepsAsync());

//SAVE ZIPCODE BASED REPS  Req body : ["asdasd","adasdas"]
app.put('/user/reps', requireAuth(), repService.saveARep());

app.post('/user/reps', requireAuth(), repService.addReps());

app.delete('/user/reps/:repId', requireAuth(), repService.deleteARep());

app.get('/zipcode/:zipcode/reps', zipCodeService.findRepsByZipCode());

app.get('/zipcode/:zipcode/viewport', zipCodeService.findViewportCoordinatesForZipcode());

app.post('/user/legislators', repService.findRepsByLatLong());

app.get('/bills/search', billService.searchBills());

app.get('/bills/summary/:billId', billService.getBillSummary());

app.get('/bills/:billId/full', billService.getBillDetails());

app.get('/bills/recent', billService.getRecentBills());

app.post('/user/filters', requireAuth(), filterService.saveFilters());

app.get('/user/filters', requireAuth(), filterService.getUserFilters() );

app.post('/reset' , requireAuth() , userBillService.clearBills());

app.post('/contact' , requireAuth() , contactService.sendFeedBack());

app.post('/available' ,userService.checkUserNameAvailability() );
