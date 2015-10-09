var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var mongoose = require('mongoose');
var express = require('express');
var exphbs = require('express-handlebars');
app = express();
app.engine('hbs', exphbs({
  defaultLayout : 'main'
}));
app.set('view engine', 'hbs');
app.set('views',  __dirname+'/../views');    // /home/venu/Documents/Venu/uberlike/Backend 

var db;
 // db = mongoose.connect("mongodb://localhost/test");

var User = require('../models/userModel');

var userController = require('../controllers/userController')();

 before(function(done){ 
 db = mongoose.connect("mongodb://localhost/test");
 done();
    });

var userObj = {};

describe('User controller tests:', function(){

        it('should say user inserted suceessfully', function(done){
          //  var User = function(user){this.save = function(){}};
          //  User.findOne = function(condition,resultcallback){resultcallback(null,null);};

               var result = {};

            var req = {
                body: {
                    "username":"venu babu",
                    "email":"titaniumstudio0@gmail.com",
                    "phonenumber":"9542750395",
                    "password":"92901529"
                }
            }
            var res = {
                status: sinon.spy(),  // function(status){console.log(status); result.status = status;},  // sinon.spy(),
                send: sinon.spy() // function(obj){console.log(obj);result.objectData = obj;} // sinon.spy()  //  function(obj){console.log(obj);}//sinon.spy()
            }

            

          //  var bookController = require('../Controllers/bookController')(Book);

          //  bookController.post(req,res);
            userController.insertUsers(req,res);
          //  console.log(res.status);
          //  console.log(res.status);
          setTimeout(function(){
             res.status.calledWith(201).should.equal(true, 'USER inserted successfully');
             done();
         },8000);
         //  assert.equal(result.status,201);

          //  console.log(res.send);
           // res.send.calledWith('Title is required').should.equal(true);
        });
        
       it('should say login successfully',function(done){
        var req = {

        }
        req.body={
          "email":"titaniumstudio0@gmail.com",
          "password":"92901529"
        }
        var res = {
          status:sinon.spy(),
          send: function(obj){console.log(obj); userObj = obj.userdata} // sinon.spy()
        }
        userController.login(req,res);
        setTimeout(function(){
          res.status.calledWith(200).should.equal(true,"USER login successfully");
          done();
        },1000);
       });

       it('should say forgot password mail send successfully',function(done){
      var req = {};
      req.body = {"email":"titaniumstudio0@gmail.com"};
      var res = {
        status:sinon.spy(),
        send:sinon.spy()
      }
      userController.forgotPassword(req,res);
      setTimeout(function(){
        res.status.calledWith(200).should.equal(true,"FORGOT PASSWORD mail send successfully");
        done();
      },4000);
     });

      it('should say confirmed user mail',function(done){
        /*
        User.findOne({"email":"titaniumstudio0@gmail.com"},function(err,result){
          if(err){
            console.log(err);
            assert
          }
          assert(err,null);

        })
      */
          console.log(userObj.confid);
         var req = {};
         req.params = {};
          req.body = {confirmId:userObj.confid};
          var res = {
            status:sinon.spy(),
            send:sinon.spy()
          };
          userController.emailConfirmation(req,res);

          setTimeout(function(){
            res.status.calledWith(200).should.equal(true,"USER email confirmed successfully");
            done();
          },2000);
      });

      it('should say password restted successfully',function(done){
        var req = {};
        req.body = {
          _id:userObj._id,
          password:'95427503'
        };
        var res = {
          status:sinon.spy(),
          send:sinon.spy()
        }

         userController.resetPasswd(req,res);

         setTimeout(function(){
          res.status.calledWith(200).should.equal(true,"USER password restet successfull");
          done();
         },1000);

      });

      it('should say mobile number verified successfully',function(done){
        var req = {};
        req.body = {
          "_id":userObj._id,
          "mconfid":userObj.mconfid
        }
        var res = {
          status:sinon.spy(),
          send:sinon.spy()
        };
        userController.verifyMobileNumber(req,res);

        setTimeout(function(){
          res.status.calledWith(200).should.equal(true,"USER mobile number confirmed successfully");
          done();
        },1000);
      });

      it('should say driver details updated successfully',function(done){
        
        var req = {};

        req.body = {
          "_id":userObj._id,
          "phonenumber":"8142322179",
          "licenceId":"APIK1087",
          "vnumber":"APJIOPDS",
          "ctype":"innovo"
        }

        var res = {
        status:sinon.spy(),
        send:sinon.spy()
      };

       userController.updateDriverDetails(req,res);

       setTimeout(function(){
        res.status.calledWith(200).should.equal(true,"DRIVER details updated successfully");
        done();
       },3000);

      });

      it('should say user phone number udated successfully',function(done){

        var req = {};

        req.body = {
          "_id":userObj._id,
          "phonenumber":"9542750395"
        }

        var res = {
          status:sinon.spy(),
          send:sinon.spy()
        }

        userController.updateMobileNumber(req,res);

        setTimeout(function(){
          res.status.calledWith(200).should.equal(true,"PASSENGER phonenumber updated successfully");
          done();
        },3000);

      });

      it('should say loginaudit information saved successfully',function(done){
          var req = {

          }

          req.body = {
            "user_id":userObj._id,
            "location":{
              "type":"Point",
              "coordinates":[78,17]
            },
            "full_address":"HPS,hyderabad,India"
          }

          var res = {
            status:sinon.spy(),
            send:sinon.spy()
          }

          userController.loginAuditInsert(req,res);

          setTimeout(function(){
            res.status.calledWith(200).should.equal(true,"LOGINAUDIT information saved successfully");
            done();
          },1010);

      });


// conn.connection.db.dropDatabase();
        
});

after(function(done){

           // db.connection.db.dropDatabase();

           for (var i in mongoose.connection.collections) {
     mongoose.connection.collections[i].remove(function() {});
   }

   /*
   mongoose.connection.close(function () {
    done();
   });
*/
        done();
        
        });