var express = require('express');
var app = express();
var server = require('http').createServer(app);
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

server.listen(3000);


app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/public')));
app.use(app.router);


function requireAuth() {
    return function(req, res, next) {
        if(req.headers['x-auth'] != null){
            req.params.user = req.headers['x-auth'];
            console.log(req.params.user);
            next();
        }
        else
            return res.status(403).send("no x-auth");

    }
}

app.get('/filter', requireAuth() , function(req, res) {
    return res.status(200).send("found auth " + req.params.user);
});