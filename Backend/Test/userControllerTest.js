var should = require('should'),
    sinon = require('sinon');

describe('user Controller Tests:', function(){
    describe('insertUsers', function(){
        it('should not allow an empty email,password,phonenumber on user', function(){

            var req = {
                body: {
                    email:'venubabu.6799@gmail.com',
                    password:'92901529',
                    phonenumber:'9542750395'
                }
            }

            var res = {
                status: sinon.spy(),
                send: sinon.spy()
            }

            var userController = require('../Controllers/userController')();

            userController.insertUsers(req,res);
            console.log(res.status.calledWith(409));
            res.status.calledWith(409).should.equal(true);
            res.send.calledWith('user already exists').should.equal(true);
        })
    })
})