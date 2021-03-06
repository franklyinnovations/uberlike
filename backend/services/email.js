var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = function sendEmail(options,callback) {

    var transporter = nodemailer.createTransport(smtpTransport({
      //  service: 'Gmail',
      /*
        host:'smtp.gmail.com',
        port:465,
        */
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

    var mailOptions = {
        from: "titaniumstudeio0@gmail.com", // sender address 
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