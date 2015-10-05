 // var should = require('should'),
 //   sinon = require('sinon');
 var request = require('request');
    var assert = require('assert');
    var host = 'http://localhost';

describe('user Controller Tests:', function(){
    describe('insertUsers', function(){
        it('should create new useraccount', function(){
            var userObj = {
                 email:'venubabu.6799@gmail.com',
                    password:'92901529',
                    phonenumber:'9542750395'
                };
                request({
                    headers:{'content-type':'application/json'},
                    url:host+'/insertuser',
                    data:userObj
                },function(err,response,result){
                    console.log(err);
                    assert.equal(err,null,"No internal errors");
                    assert.equal(response.statusCode,409,"user already exists");
                });
        });
    });
});