var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');



var transporter = nodemailer.createTransport(smtpTransport({
          transport: "SMTP",
    host: "smtp.gmail.com",
    secureConnection: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
        auth: {
            user: 'titaniumstudio0@gmail.com',
            pass: '92901529'
        }
    }));



module.exports = function sendEmail(options,callback) {

    var mailOptions = {
        from: options.from || "titaniumstudeio0@gmail.com", // sender address 
        to: options.email, // list of receivers 
        subject: options.subject, // Subject line 
       // text: 'Hello world ✔', // plaintext body 
        html: options.html//'<b>Hello world ✔</b>' // html body 
    };

    transporter.sendMail(mailOptions, function(error, info) {
        
        if(error){
           // return console.log(error);
           console.log(error);
        	callback(error,null);
        }else{
            //console.log('Message sent: ' + info.response);
     		console.log(info);
     		callback(null,info);
     	}
    });
}