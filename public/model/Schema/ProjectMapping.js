var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    ProjectID: String,
    FacilityID: String,
    UserName: String,
    Allow: Boolean,
    Role:String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }

},
    { versionKey: false });


var ProjectMapping = mongoose.model("pms_ProjectMapping", Schema);

exports.InsertProjectMapping = (req, res) => {


    ProjectMappings = new ProjectMapping(req.body);
  
    ProjectMappings.save(function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }


    });
};


exports.CheckProjectMapping = (req, res) => {

    var ProjectID = req.params.ProjectID;
    var FacilityID = req.params.FacilityService;
    ProjectMapping.find({ ProjectID: ProjectID, FacilityID: FacilityID }, function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }


    });



};


exports.UpdateProjectMapping = (req, res) => {
    var id = req.body.ID;
    var ProjectID = req.body.ProjectID;
    var FacilityID = req.body.FacilityID;
    var UserName = req.body.UserName;
    var Allow = req.body.Allow;


    ProjectMapping.update({ _id: id, ProjectID: ProjectID, FacilityID: FacilityID, UserName: UserName }, {
        $set: {
            Allow: Allow
        }
    },
        function (err, doc) {
            if (err) {
                console.log(err);
            }
            res.json(doc);
            return doc;
        }
    );

} 