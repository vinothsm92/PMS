
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    ID:Number,
   Name: String,
    Description: String,
    FacilityID:String,
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });




var newConfigureItem = mongoose.model("pms_ConfigurableItem_Master", Schema);

exports.AddNewConfigureItem = (req, res) => {

  //  newConfigureItem
    NewConfigureItems= new newConfigureItem(
        {
            ID:req.body.ID,
            Name: req.body.Name,
            Description: req.body.Description,
             FacilityID:req.body.FacilityID,
            CreatedById: req.body.CreatedById,
            UpdatedById: ''

         
        })

        NewConfigureItems.save(function (err, doc) {

        if (err) {
            //  console.log("Error Occured");
            console.error(err);
            res.json(err);

        }

        res.json(doc);
        // res.send('Successfully inserted!');

    });
};








exports.ShowConfigureItems = (req, res) => {
    FacilityID = req.params.FacilityService;
    newConfigureItem.find({FacilityID: FacilityID}).sort({ '_id': -1 }).exec(function (err, docs) {
            if (err) {
                // console.log("Error Occured");
                console.log(err);
            }
    
            res.json(docs);
    
    
        });}
         
    

    exports.DeleteConfigureItem = (req, res) => {
        var id = req.params.ConfigureItemId;
    
        newConfigureItem.findByIdAndRemove((id),function (err, doc) {  
    
                if (err) {
                    // console.log("Error Occured");
                    console.log(err);
                }
        
                res.json(doc);
        
        
            });
        };


    



exports.UpdateConfigureItem= (req, res) => {

    var id=req.body.id;
    var ItemID = req.body.ID;
    var Name = req.body.Name;
    var Description = req.body.Description;
   var FacilityID=req.body.FacilityID;
    var updatedBy = req.body.updatedBy;


    newConfigureItem.update({ _id: id }, {
        $set: {
            
           Name: Name,
            Description: Description,
         FacilityID:FacilityID,
            UpdatedById: updatedBy

        }
    },
        function (err, doc) {
            if (err) {
            // console.log("Error occured");
                console.log(err);

            }

            res.json(doc);
          //   console.log("Updated successfully");
            //    return res.send(204);

        }
    );
};


