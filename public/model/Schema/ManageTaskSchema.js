var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    TaskDescription: String,
    Duration: String,
    PlanEndDate: String,
	PlanStartDate:String,
    ActualEndDate: String,
    StartDate: String,
    EndDate: String,
    ActualDuration: String,
    ProjectID: String,
    TaskCategoryName: String,
    TaskStatusName: String,
    TaskPriorityName: String,
    TeamLeaderUserID: String,
    isMailSend: String,
    ResourceComments: String,
    TeamMemberUserID: String,
    IsVisible: String,
    UniqueID: String,
    TypeNew: String,
    IsBillable: String,
    IsCR: String,
    Predecessors: String,
    TypeNew: String,
    IsBillable: String,
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    FacilityID: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });

var NewTask = mongoose.model("pms_ManageTask", Schema);

exports.AddTask = (req, res) => {

    NewTask.collection.insert(req.body, onInsert);

    function onInsert(err, docs) {
        if (err) {
            console.log(err);
            // TODO: handle error
        } else {
            //console.info('successfully stored.', docs.length);
            res.json("successfully stored.");
        }
    }
};

exports.GetTaskBasedFacilityDetails = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewTask.find({ FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTaskBasedProjDetails = (req, res) => {
   
    return new Promise(function (resolve,reject){
        NewTask.find({ ProjectID:req }, function (err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                return;
            }
            resolve(docs);
        });
    })
   
};

exports.GetTaskBasedProjDetails1 = (req, res) => {
    NewTask.find({ ProjectID:req.params.Id }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
   
   
};

exports.GetTaskGridValues = (req, res) => {
    //TeamMemberUserID=req.params.UserName;
    FacilityID = req.params.FacilityService;
    ProjectID = req.params.GridProjectID;

    NewTask.find({  ProjectID: ProjectID ,FacilityID: FacilityID}, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetTaskGridValues11 = (req, res) => {

    FacilityID = req.params.FacilityService;
    username = req.params.username;



    NewTask.find({ FacilityID: FacilityID, TeamMemberUserID: username }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetTaskGridValues1 = (req, res) => {

    FacilityID = req.params.FacilityService;
    ProjectID = req.params.GridProjectID;
    username = req.params.UserName;

    NewTask.find({ FacilityID: FacilityID, ProjectID: ProjectID, TeamMemberUserID: username }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetProjName = (req, res) => {
    FacilityID = req.params.FacilityService;
    username = req.params.username;
    NewTask.aggregate([

        //where query
        { "$match": { FacilityID: FacilityID, TeamMemberUserID: username } },
        //distinct column 
        { "$group": { _id: { ProjectID: "$ProjectID" } } },
        //provide column name for the output
        { "$project": { _id: 0, ProjectID: "$_id.ProjectID" } }
    ], function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetProjUserName = (req, res) => {
    FacilityID = req.params.FacilityService;
    ProjectID = req.params.ProjectID;
    NewTask.aggregate([

        //where query
        { "$match": { FacilityID: FacilityID, ProjectID: ProjectID } },
        //distinct column 
        { "$group": { _id: { TeamMemberUserID: "$TeamMemberUserID" } } },
        //provide column name for the output
        { "$project": { _id: 0, TeamMemberUserID: "$_id.TeamMemberUserID" } }
    ], function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.UpdateManageTaskDetailsUpsert = (req, res) => {
    var id = req.body.id;
    var TaskDescription = req.body.TaskDescription;
    var PlanStartDate = req.body.PlanStartDate;
    var Duration = req.body.Duration;
    var PlanEndDate = req.body.PlanEndDate;
    var ProjectID = req.body.ProjectID;
    var TaskCategoryName = req.body.TaskCategoryName;
    var TeamLeaderUserID = req.body.TeamLeaderUserID;
    var TeamMemberUserID = req.body.TeamMemberUserID;
    var UniqueID = req.body.UniqueID;
    var TypeNew = req.body.TypeNew;
    var IsBillable = req.body.IsBillable;
    var Predecessors = req.body.Predecessors
    var IsCR = req.body.IsCR;
    var CreateById = req.body.CreateById;
    var CreateOn = req.body.CreateOn;
    var UpdateById = req.body.UpdateById
    var FacilityID = req.body.FacilityID;
    NewTask.update({ ProjectID: ProjectID,UniqueID:UniqueID },
            {
                $set: {
                    TaskDescription: TaskDescription,
            PlanStartDate: PlanStartDate,
            Duration: Duration,
            PlanEndDate: PlanEndDate,
            ProjectID: ProjectID,
            TaskCategoryName: TaskCategoryName,
            TeamLeaderUserID: TeamLeaderUserID,
            TeamMemberUserID: TeamMemberUserID,
            UniqueID: UniqueID,
            TypeNew: TypeNew,
            IsBillable: IsBillable,
            Predecessors: Predecessors,
            IsCR: IsCR,
            CreateById: CreateById,
            CreateOn: CreateOn,
            UpdateById: UpdateById,
            FacilityID: FacilityID,
    
                }
            },{ upsert: true },
            function (err, doc) {
                if (err) {
                    console.log(err);
                }
    
                res.json(doc);
                //    return res.send(204);
    
            }
        )
    };


exports.UpdateManageTaskDetails = (req, res) => {
    var id = req.body.id;
    var TaskDescription = req.body.TaskDescription;
    var PlanStartDate = req.body.PlanStartDate;
    var Duration = req.body.Duration;
    var PlanEndDate = req.body.PlanEndDate;
    var ProjectID = req.body.ProjectID;
    var TaskCategoryName = req.body.TaskCategoryName;
    var TeamLeaderUserID = req.body.TeamLeaderUserID;
    var TeamMemberUserID = req.body.TeamMemberUserID;
    var UniqueID = req.body.UniqueID;
    var TypeNew = req.body.TypeNew;
    var IsBillable = req.body.IsBillable;
    var Predecessors = req.body.Predecessors
    var IsCR = req.body.IsCR;
    var CreateById = req.body.CreateById;
    var CreateOn = req.body.CreateOn;
    var UpdateById = req.body.UpdateById
    var FacilityID = req.body.FacilityID;

    NewTask.update({ _id: id }, {
        $set: {

            TaskDescription: TaskDescription,
            PlanStartDate: PlanStartDate,
            Duration: Duration,
            PlanEndDate: PlanEndDate,
            ProjectID: ProjectID,
            TaskCategoryName: TaskCategoryName,
            TeamLeaderUserID: TeamLeaderUserID,
            TeamMemberUserID: TeamMemberUserID,
            UniqueID: UniqueID,
            TypeNew: TypeNew,
            IsBillable: IsBillable,
            Predecessors: Predecessors,
            IsCR: IsCR,
            CreateById: CreateById,
            CreateOn: CreateOn,
            UpdateById: UpdateById,
            FacilityID: FacilityID,

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

exports.GetTimeSheeetID = (req, res) => {
    var GetEventID = req.params.GetEventID;
    NewTask.find({ _id: GetEventID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTaskEvent = (req, res) => {
    var GetEventID = req.params.GetEventID;
    NewTask.find({ _id: GetEventID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetManageTaskConfig = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewTask.find({ FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};






exports.updatetaskphase = (req, res) => {
    var id = req.params.TaskId;
    var TaskEndDate= req.params.ActualEndDate;

    NewTask.update({ _id: id }, {
        $set: {
            ActualEndDate: TaskEndDate
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


//added
exports.getTaskDetails = (req, res) => {
    var GetEventID = req.params.GetEventID;
    var TeamMemberUserID = req.params.username;
    var ProjectID = req.params.ProjectID;
    NewTask.find({ TaskDescription: GetEventID,ProjectID:ProjectID,TeamMemberUserID:TeamMemberUserID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetAllTaskEvent = (req, res) => {
    //var GetEventID = req.params.GetEventID;
    NewTask.find({ ProjectID: req.params.ProjectID,TeamMemberUserID:req.params.username,FacilityID:req.params.FacilityService }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

