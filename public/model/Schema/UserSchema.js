
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    DisplayName: String,
    Email: String,
    FirstName: String,
    LastName: String,
    Mobile: Number,
    Role: String,
    EmailVerified: Boolean,
    Status: String,
    IsActive: Boolean
});

var newUser = mongoose.model("Manage_User", Schema);

exports.UserEntry = (req, res) => {

 
    NewUser = new newUser(req.body);

    NewUser.save(function (err, doc) {
        
        if (err) {
            res.json(err);

        }
     
res.json(doc);
            // res.send('Successfully inserted!');
       
    });
};




        exports.ShowSKUMaster = (req, res) => 
        {
             newSKUMaster.find({ IsActive: 1 }).sort({ '_id': -1 }).exec( function (err, docs) {
            res.json(docs);

        });
    }



exports.ShowUsers = (req, res) => 
{


    newUser.find({}).sort({ '_id': -1 }).exec(, function (err, docs) {
       
        res.json(docs);

    });
};


exports.ShowUserID = (req, res) => {
    newUser.find({}, {id:1}, function (err, docs) {
       
        res.json(docs);

    });
};


exports.UpdateUser = (req, res) => {

   
    var id = req.params.id;
    var Displayname = req.params.displayname;
    var EmailId = req.params.email;
    var Firstname = req.params.fname;
    var Lastname = req.params.lname;
    var mobile = req.params.mobile;
    var RoleId = req.params.role;
    var emailverified = req.params.emailverified;
    var status = req.params.status;
    var Isactive = req.params.isActive;


    newUser.update({ _id: id }, {
        $set: {
            DisplayName: Displayname, Email: EmailId, FirstName: Firstname,
            LastName: Lastname, Mobile: mobile, Role: RoleId, EmailVerified: emailverified,
            Status: status, IsActive: Isactive
        }
    },
       function (err, doc) {
           if (err) 
           {
              
           }
      
               return res.send(204);
          
       }
   );
};

exports.DeleteManageUser = (req, res) => {
      var id = req.params.Userkeyid;
    newUser.findByIdAndRemove(id).exec().then(function (err, doc)
     {
         if(err)
         {
             console.log(err);
         }
        res.json(doc);
        return doc;

    });
};




