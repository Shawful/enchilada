var config = require('/opt/apps/properties/config.json');
var postmark = require("postmark")(config.postmarkApiEb);

exports.sendVerificationEmail = function(email,verificationCode) {
    return function(req, res) {
        var emailBody = "Hi Easyballot user,<br><br>\n\
                Please click the link below to get the account verified.<br><br>\n\
                <a href=''>click here</a> <br><br>\n\
                Thank you,<br>\n\
                Easyballot Support team";

        postmark.send({
            "From": "support@easyballot.org",
            "To": email,
            "Subject": "Activation email from Easyballot",
            "HtmlBody": emailBody

        }, function(error, success) {
            if (error) {
                console.error("Unable to send via postmark: " + error.message);
                return;
            }
            console.info("Sent to postmark for delivery");
        });


    };

};


exports.sendContactUsInfoToAdministrators= function(contact){
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.contactUsEmail,
            pass: config.contactUsEmailPassword
        }
    });
    var emailBody = "<h4>Sender</h4>  : "+contact.email+" <br>\n\ <h4>Subject</h4>: "+contact.subject+" <br> <h4>Body</h4> : "+contact.body; 
                     
                     
    transporter.sendMail({
        from: config.contactUsEmail,
        to: config.contactUsEmail,
        subject: 'Feedback',
        html: emailBody
    });
};
