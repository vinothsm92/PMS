
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    ProjectName: String,
    TeamLeader: String,
    FacilityID: String,
    IsActive: Boolean,
    ClientName: String,
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });



var NewTeam = mongoose.model("pms_ProjectTeam", Schema);

exports.AddTeam = (req, res) => {


    NewTeams = new NewTeam(req.body);

    NewTeams.save(function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }


    });
};


exports.GetManageTeamDetails = (req, res) => {
    FacilityID = req.params.FacilityService;

    NewTeam.find({ IsActive: true, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};



exports.Getteamdetails = (req, res) => {
    FacilityID = req.params.FacilityService;

    NewTeam.find({ IsActive: true, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.DeleteTeamDetails = (req, res) => {

    var ID = req.body.DeleteRowKey;

    NewTeam.findByIdAndRemove(ID).exec().then(function (err, doc) {
        res.json(doc);
        return doc;

    });

}


exports.GetResourcesBasedProjectDeleteCheck = (req, res) => {
    ProjectID = req.params.ProjectID;
    NewTeam.find({ ProjectName: ProjectID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};




exports.projectteamsUpdate = (req, res) => {
    ProjectID = req.body.id;
    TeamLead = req.body.TeamLeaderUserID;
    NewTeam.update(
        { ProjectName: ProjectID },
        { $set: { TeamLeader: TeamLead } },
        { upsert: true, multi: true }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });


};





var mongoose = require('mongoose');
var Schema1 = mongoose.Schema;



var Schema1 = new Schema1({

    ProjectID: String,
    TeamLeaderUserID: String,
    TeamMemberUserID: String,
    IsActive: Boolean,
    Mail: Boolean,
    BillingRateInDoller: Number,
    CreatedById: String,
    FacilityID: String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });



var NewTeamMembers = mongoose.model("pms_ProjectTeamDetails", Schema1);

exports.AddTeamMembers = (req, res) => {
    NewTeamMember = new NewTeamMembers(req.body);
    NewTeamMember.save(function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }
    });
};



exports.Getresourceview = (req, res) => {
    FacilityID = req.params.FacilityService;

    NewTeamMembers.find({ IsActive: true, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetresourceviewDuplicate = (req, res) => {
    ProjectID = req.params.ProjectId;
    UserID = req.params.data;

    NewTeamMembers.find({ TeamMemberUserID: UserID, ProjectID: ProjectID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};



exports.RemoveTeamMembersDetails = (req, res, next) => {
    var projectid = req.body.ProjectDeleteID;


    NewTeamMembers.collection.remove({ ProjectID: projectid }, function (err, docs) {
        if (err) console.log(err);
        else res.json(docs);

    });
};


exports.GetResourcesBasedProject = (req, res) => {
    ProjectID = req.params.ProjectID;


    NewTeamMembers.find({ ProjectID: ProjectID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetProjectTeamMembers = (req, res) => {
    return new Promise(function(resolve,reject){


        NewTeamMembers.find({ ProjectID: req }, function (err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                return;
            }
            resolve(docs);
        });
    })


    
};


exports.GetProjectTeamMembers1 = (req, res) => {
    NewTeamMembers.find({ ProjectID: req.params.Id }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });


   
};

exports.GetResourcesBasedProject1 = (req, res) => {
    ProjectName = req.params.ProjectName;


    NewTeamMembers.find({ ProjectID: ProjectName }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.RemoveResourcesBasedProject = (req, res, next) => {
    var projectid = req.params.ProjectID;
    NewTeamMembers.collection.remove({ ProjectID: projectid }, function (err) {
        if (err) console.log(err);
        else return next();

    });
};



exports.UpdateResourcesBasedProject = (req, res) => {


    NewTeamMembers.collection.insert(req.body, onInsert);

    function onInsert(err, docs) {
        if (err) {
            console.log(err);
            // TODO: handle error
        } else {
            //console.info('successfully stored.', docs.length);
            res.json(docs);
        }
    }
};



exports.UpdateBillingRateValues = (req, res) => {
    var id = req.body.id;
    var BillRate = req.body.BillingRate;

    NewTeamMembers.update({ _id: id }, {
        $set: {
            BillingRateInDoller: BillRate
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

exports.projectteamsDetailsUpdate = (req, res) => {
    ProjectID = req.body.id;
    TeamLead = req.body.TeamLeaderUserID;
    NewTeamMembers.update(
        { ProjectID: ProjectID },
        { $set: { TeamLeaderUserID: TeamLead } },
        { upsert: true, multi: true }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });


};


exports.GetteamMemberdetails = (req, res) => {
    FacilityID = req.params.FacilityService;


    NewTeamMembers.find({ FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};
exports.GetteamMemberDetailsForTask = (req, res) => {
    ProjectID = req.params.ProjectID;
    NewTeamMembers.find({ ProjectID: ProjectID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};