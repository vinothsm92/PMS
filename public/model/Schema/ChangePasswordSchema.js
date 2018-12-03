const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    Email: { type: String, unique: true },
    UserName: String,
    Password: String,
    PhoneNumber: String,
    EmailVerifiedbyUser: Boolean,
    Role: String,
    IsApprovedByAdmin: String,
    IsActive: Boolean,
    EmailConfirmationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    UpdatedOn: { type: Date, default: Date.now },

}, { versionKey: false });

var ChangePwd = mongoose.model("pms_users", userSchema);



exports.postSignup = (req, res) =>
 {

    var TakeUserBasedPassword = req.params.username;
  
    ChangePwd.find({ UserName: TakeUserBasedPassword }, function (err, docs) 
    {
      if(err)
      {
         
        console.log(err);
      }
        res.json(docs); 

    });
 

};
 
 exports.postcheckpwd = (req, res) => {

                 
bcrypt.compare(req.body.CurrentPWD, req.body.checkuserpassword, function(err, result) 
{
      
          if(result){
            res.send("Same");   
                
            }
            else{         
            res.send("Not Same");       
        }   
        
          
});
    
};
exports.ConfirmPassowrdEntry = (req, res) => 
{
   
     var UserName = req.params.username;
     var ConfirmPwd = req.params.confirmPwd;
         bcrypt.genSalt(10,function(err,salt){
         bcrypt.hash(ConfirmPwd, salt, null,function(err, hash) {
   
    ChangePwd.update({ UserName: UserName }, { $set: { Password:hash} },
   function (err, doc) {
       if (err) {
           console.log(err);
       }
      
             res.json(doc);
             return doc;
          // return res.send(204);
      
   });
       
       
    });


   
});









 };