var twilio = require('twilio');

var accountSid = 'ACf678f8a1909b0f5c04df81e42e4af2fc'; 
var authToken = '837d2b93452b137288ee26bfb82c75d1'; 

function sendMessage(mobileNumber,messageText,callback){
 var client = new twilio.RestClient(accountSid, authToken);
 client.messages.create({
    to:'+91'+mobileNumber,    // '+919542750395',
    from:'+17409364714',
    body:messageText      // 'Hi venu i am sending the text message to greet you!.'
}, function(error, message) {
    if (error) {
        console.log(error.message);
      //  res.send({"status":"error","msg":error.message});
      callback(error,null);
    }else{
      
      //	res.send({"status":"success","msg":message});
       callback(null,message);
    }
});
}
module.exports = sendMessage;