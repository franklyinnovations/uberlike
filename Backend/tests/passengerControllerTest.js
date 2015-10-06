 var request = require('request');
    var assert = require('assert');
    var host = 'http://localhost';

    describe('user Controller Tests:', function(){
    	describe('finding matching routes',function(){
    it('should say ok status',function(done){
        var userObj = {
              "from":"Shoppers Stop Bus Stop, Chikoti Gardens, Begumpet, Hyderabad, Telangana, India",
  "to":"uppal stadium, Uppal Stadium Road, IDA Uppal, Hyderabad, Telangana, India",
  "start_time":"6:15 PM",
  "start_date":"2015-09-20",
  "user_id":"f6a5d829-ffb5-4389-b5f3-9de267b71740"
        }
        request.post(host+'/passengers/search/matches',{form:userObj},function(error,response,result){
            result = JSON.parse(result);
          //  console.log(result);
            assert.equal(response.statusCode,200,"status 200");
          //  assert.equal(result.msg,"Email send to titaniumstudio0@gmail.com successfully.");
            done();
        });
 });
  it('should say 400 status',function(done){
        var userObj = {
              "from":"Shoppers Stop Bus Stop, Chikoti Gardens, Begumpet, Hyderabad, Telangana, India",
  "to":"uppal stadium, Uppal Stadium Road, IDA Uppal, Hyderabad, Telangana, India",
  "start_time":"6:15 PM",
  "start_date":"2015-09-20"
  // "user_id":"f6a5d829-ffb5-4389-b5f3-9de267b71740"
        }
        request.post(host+'/passengers/search/matches',{form:userObj},function(error,response,result){
            result = JSON.parse(result);
            console.log(result);
            assert.equal(response.statusCode,400,"status 400");
          //  assert.equal(result.msg,"Email send to titaniumstudio0@gmail.com successfully.");
            done();
        });
    });
    });	
});