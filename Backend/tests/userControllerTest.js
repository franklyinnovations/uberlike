 // var should = require('should'),
 //   sinon = require('sinon');
 var request = require('request');
    var assert = require('assert');
    var host = 'http://localhost';

describe('user Controller Tests:', function(){
    describe('insertUsers', function(){
        it('should check already existing useraccount', function(done){
            var userObj = {
                    email:'venubabu.6799@gmail.com',
                    password:'92901529',
                    phonenumber:'9542750395'
                };
              //  var result ;
                request.post(host+'/insertuser',{form:userObj},function(err,response,result){
                    console.log(err);
                    console.log(response.statusCode);
                    console.log(JSON.parse(result).msg);
                  //  assert.equal(err,null,"No internal errors");
                   // assert.equal(response.statusCode,500);
                   var result = JSON.parse(result);
                      assert.equal(response.statusCode,409,"status 409");
                      assert.equal(result.msg,'user email or phone number already exists',"existing user");
                      done();
                });
             //   done();
     });
        it('should say invalid email address',function(done){
            var userObj = {
                email:'venubabu',
                password:'92901529',
                phonenumber:'9542750395'
            };
            request.post(host+'/insertuser',{form:userObj},function(err,response,result){
              //  assert.equal(err,null,"No internal errors");
              result = JSON.parse(result);
              console.log(result.msg);
                assert.equal(response.statusCode,400,"status 400");
                assert.equal(result.msg,"Please enter valid email","Invalid email");
                done();
            });
        });
        it('should say phonenumber is invalid',function(done){
            var userObj = {
                email:'venubabu@gmail.com',
                password:'92901529',
                phonenumber:'95427503956'
            };
            request.post(host+'/insertuser',{form:userObj},function(err,response,result){
              //  assert.equal(err,null,"No internal errors");
              result = JSON.parse(result);
              console.log(result.msg);
                assert.equal(response.statusCode,400,"status 400");
                assert.equal(result.msg,"Please enter valid Phone number","phonenumber is in valid");
                done();
            });
        });
    });
 describe('login User',function(){
    it('should say login successfully',function(done){
        var userObj = {
            "email":"titaniumstudio0@gmail.com",
  "password":"92901529"
        }
        request.post(host+'/login/passenger',{form:userObj},function(error,response,result){
            result = JSON.parse(result);
         //   console.log(result);
            assert.equal(response.statusCode,200,"status 200");
         //   assert.equal(result.msg,"User login successfull");
            done();
        });
    });
 });
 describe('forgot password',function(){
    it('should say email sended successfully',function(done){
        var userObj = {
              "email":"titaniumstudio0@gmail.com"
        };
        request.post(host+'/forgotpassword',{form:userObj},function(error,response,result){
            result = JSON.parse(result);
            console.log(result);
            assert.equal(response.statusCode,200,"status 200");
            assert.equal(result.msg,"Email send to titaniumstudio0@gmail.com successfully.");
            done();
        });
    });
 });
 describe('Reset password',function(){
  it('should say password reset successfully',function(done){
       var userObj = {
        "_id":"f6a5d829-ffb5-4389-b5f3-9de267b71740",
        "password":'92901529'
       };
       request.post(host+'/reset/password',{form:userObj},function(error,response,resultData){
        resultData = JSON.parse(resultData);
        console.log(resultData.msg);
        assert.equal(response.statusCode,200,"status 200");
        assert.equal(resultData.msg,"Password resetting successfullY!","resetting password successfully.");
        done();
       });
  });
 });
 describe("updating phone number",function(){
  it('should say phonenumber updated successfully',function(done){
    var userObj = {
      _id:"5f1077fe-1cfc-4c54-9294-c7072470a388",
      phonenumber:"9542750395"
    };
    request.post(host+'/update/mobilenumber',{form:userObj},function(error,response,resultData){
       resultData = JSON.parse(resultData);
       console.log(resultData.msg);
       assert.equal(response.statusCode,200,"status 200");
       assert.equal(resultData.msg,"MobileNumber updated successfully.","phone number updation successfully");
       done();
    });
  });
 });

 // phonenumber licenceId vnumber ctype
 describe("updating driver details",function(){
  it('should say driver details updated successfully',function(done){
      var userObj = {
        phonenumber:'9542750395',
        licenceId:'Ab23CD3426',
        vnumber:'AP30DS1206',
        ctype:'Ambasidor',
        _id:"5f1077fe-1cfc-4c54-9294-c7072470a388"
      };
      request.post(host+'/update/driverdetails',{form:userObj},function(error,response,result){
        result = JSON.parse(result);
        console.log(result.msg);
        assert.equal(response.statusCode,200,"status 200");
        assert.equal(result.msg,"Driver details updated successfully.Please confirm your mobile number","driver details updation successfull");
        done();
      });
  });
 });
});