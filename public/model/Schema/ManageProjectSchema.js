
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    ProjectName: String,
    TeamLeaderUserID: String,
    StartDate: String,
    EndDate: String,
    BillingType: String,
    EffortInDays: Number,
    RevenueInDoller: Number,
    Description: String,
    ProjectStatus: String,
    ClientName: String,
    CreatedById: String,
    FacilityID: String,
    IsActive: Boolean,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }

},
    { versionKey: false });



var NewProject = mongoose.model("pms_projectdetails", Schema);

exports.AddProjectDetails = (req, res) => {


    NewProjects = new NewProject(req.body);

    NewProjects.save(function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }


    });
};



exports.GetProjectDetails = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetAllProjectDetails = (req, res) => {
    return new Promise(function (resolve, reject) {
        NewProject.find({ },{_id:1,ProjectName:1}, function (err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                return;
            }
            else {
                resolve(docs);
            }
        });

    });

};

exports.GetProj = (req, res) => {



    NewProject.find({ IsActive: true }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};
exports.GetProjectDetails1 = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ FacilityID: FacilityID, IsActive: true }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetProjectEndDate = (req, res) => {
    FacilityID = req.params.FacilityService;
    id = req.params.ProjectID;
    NewProject.find({ _id: id, FacilityID: FacilityID, IsActive: true }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetUpdateProjectDetails = (req, res) => {
    ID = req.params.id;
    NewProject.find({ _id: ID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};



exports.UpdataProjectDetailsData = (req, res) => {
    var id = req.body.id;
    var ProjectName = req.body.ProjectName;
    var TeamLeaderUserID = req.body.TeamLeaderUserID;
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    var BillingType = req.body.BillingType;
    var EffortInDays = req.body.EffortInDays;
    var RevenueInDoller = req.body.RevenueInDoller;
    var Description = req.body.Description;
    var ProjectStatus = req.body.ProjectStatus;
    var ClientName = req.body.ClientName;
    var UpdatedById = req.body.UpdatedById;
    var FacilityID = req.body.FacilityID;
    var IsActive = req.body.IsActive;

    NewProject.update({ _id: id }, {
        $set: {

            ProjectName: ProjectName,
            TeamLeaderUserID: TeamLeaderUserID,
            StartDate: StartDate,
            EndDate: EndDate,
            BillingType: BillingType,
            EffortInDays: EffortInDays,
            RevenueInDoller: RevenueInDoller,
            Description: Description,
            ProjectStatus: ProjectStatus,
            ClientName: ClientName,
            UpdatedById: UpdatedById,
            FacilityID: FacilityID,
            IsActive: IsActive

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



exports.GetProjectDetailsINprogress = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ IsActive: true, FacilityID: FacilityID, ProjectStatus: 1 }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetProjectDetailsComplete = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ IsActive: true, FacilityID: FacilityID, ProjectStatus: 2 }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};



exports.GetProjectDetailsDelete = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ IsActive: false, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};




exports.ProjectReactive = (req, res) => {
    var id = req.body.id;

    NewProject.update({ _id: id }, {
        $set: {
            IsActive: true
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



exports.DeleteProjectReactive = (req, res) => {
    var id = req.body.id;

    NewProject.update({ _id: id }, {
        $set: {
            IsActive: false
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



exports.GetProjectDetailsforteam = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewProject.find({ IsActive: true, FacilityID: FacilityID, ProjectStatus: 1 }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.Getteamleader = (req, res) => {
    projectid = req.params.ProjectID;
    NewProject.find({ IsActive: true, _id: projectid }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetCilentNamesDeleteCheck = (req, res) => {
    ClientID = req.params.CID;
    NewProject.find({ ClientName: ClientID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetProjectNamesfortask = (req, res) => {
    FacilityID = req.params.FacilityService;





    NewProject.find({ FacilityID: FacilityID, ProjectStatus: 1, IsActive: true }).sort({ 'ProjectName': 1 }).exec(function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });



    // NewProject.find({  FacilityID: FacilityID,ProjectStatus: 1,IsActive:true  }, function (err, docs) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.json(docs);
    // });
};

exports.GetTeamLeadProjectProj = (req, res) => {
    username = req.params.username;

    NewProject.find({ TeamLeaderUserID: username, ProjectStatus: 1, IsActive: true }).sort({ 'ProjectName': 1 }).exec(function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });



};