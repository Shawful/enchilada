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

