var config = require('/opt/apps/properties/config.json');
var apikey = config.sunlight_apikey;
var http = require('https');

exports.searchBills = function(MongoClient) {
    return function(req, res) {
    var billSearch = req.query.bill;
    
    if(! billSearch)
        return res.status(400).send('missing bill search text');
    var limit = req.query.per_page ;
    var page = req.query.page;
    if(!page)
        page =1;
    if(!limit)
        limit = 5;
    
    var re = /(hr|s)[0-9]/;
    var billPath;
    if(!re.test(billSearch))
        billPath = '/bills/search?congress__in=113|112|111&query="'+encodeURIComponent(billSearch)+'"&history.enacted=true&per_page='+limit+"&page="+page;
    else
        billPath = '/bills/search?bill_id=' + billSearch + '-113&fields=bill_id,official_title,short_title' ;       
    
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: billPath,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bills = http.request(options, function( response) {
        
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
                        
    bills.write("");
    bills.end();

    };
};

exports.getBillSummary = function() {
    return function(req, res) {
    var billId = req.param("billId");    
    
    if(! billId)
        return res.status(400).send('missing bill Id');
    var limit = req.query.per_page ;
    if(!limit)
        limit = 5;
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?bill_id='+billId+'&fields=summary_short',
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bill = http.request(options, function( response) {
                
                response.on('data', function (data) {
                        data = JSON.parse(data);
                        
                        return res.status(200).send(data.results);
                });
                response.on('error', function (e) {
                        console.log(e);
                        return  res.status(400).send(e);
                });
    });
                        
    bill.write("");
    bill.end();

    };
};

exports.getBillDetails = function() {
    return function(req, res) {
    var billId = req.param("billId");    
    
    if(! billId)
        return res.status(400).send('missing bill Id');
    
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?bill_id='+billId,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bill = http.request(options, function( response) {
                
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
                        
    bill.write("");
    bill.end();

    };
};

exports.getRecentBills = function() {
    return function(req, res) {
    
    var limit = req.query.per_page;
    var page = req.query.page;
    if(!page)
        page =1;
    if(!limit)
        limit = 5;
   
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills?order=last_action_at&per_page='+limit+'&page='+page,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bills = http.request(options, function( response) {
        
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
                        
    bills.write("");
    bills.end();

    };
};




