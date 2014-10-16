var emailService = require('../services/email');

exports.sendFeedBack= function(contactUs){
    return function(req,res){
        
        var user = req.params.user;
        var contact = req.body;
        if(contact){
            if(!contact.subject || !contact.body )
                return res.status(400).send("incorrect parameters");
            else{
                contact.email = user._id;
                emailService.sendContactUsInfoToAdministrators(contact);
                return res.status(200).send('Feedback received');
            }
        }else{
            return res.status(400).send("incorrect parameters");
        }
        
    };
    
};