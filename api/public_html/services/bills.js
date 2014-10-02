exports.searchBills = function(MongoClient) {
    return function(req, res) {
    var billSearch = req.query.bill;
    
    if(! billSearch)
        return res.status(400).send('missing bill search text');
    var limit = req.query.per_page ;
    if(!limit)
        limit = 5;
    var options = {
                host: 'congress.api.sunlightfoundation.com',
                path: '/bills/search?congress=113&query="'+encodeURIComponent(billSearch)+'"&history.enacted=true&per_page='+limit,
                method: 'GET',
                headers: {'x-apikey': apikey }
    };
    
    var bills = http.request(options, function( response) {
                response.on('data', function (data) {
                        data = JSON.parse(data);
                        
                        return res.status(200).send(data.results);
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