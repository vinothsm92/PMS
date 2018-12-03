
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    Text: String,
    Start: String,
    StartDate: String,
    End: String,
    Hours:Number,
    phase: String,
    Resource: String,
    ProjectID: String,
    UserName: String,
    Comments: String,
    Publish: Number,
    TaskType: String,
    Items: String,
    FacilityID: String,
    CreatedByID: String,
    UpdatedByID:String,
    TaskID:String,
	TimeSheetID:String,
    TaskDescription:String,
    CreatedOn: { type: Date, default: Date.now },
    FacilityID: String,
    UpdatedOn:{ type: Date, default: Date.now }
},
    { versionKey: false });

var TeamLeadTimeSheet = mongoose.model("pms_TeamLeadTimeSheet", Schema);

exports.AddTimeSheet = (req, res) => {

    TeamLeadTimeSheet.collection.insert(req.body, onInsert);

    function onInsert(err, docs) {
        if (err) {
            console.log(err);

        } else {

            res.json(docs);
        }
    }
};


exports.UpdateTimeSheet = (req, res) => {
    var StartDate = req.body.StartDate;
    var year = StartDate.substring(0, 4);
    var month = StartDate.substring(5, 7);
    var date = StartDate.substring(8, 10);
    var fulldate = date + '-' + month + '-' + year;
    var Publish = req.body.Publish;
   
  



    TeamLeadTimeSheet.update(
        { StartDate: fulldate },
        {
            $set: {
                Publish: Publish
            }
        },
        {  multi: true }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });

}


exports.UpdateResize = (req, res) => {
    var id = req.body.id;
    var Start = req.body.Start;
    var End = req.body.End;
    var Hours=req.body.Hours;


    TeamLeadTimeSheet.update({ _id: id }, {
        $set: {

            Start: Start, End: End,Hours:Hours

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

exports.UpdataEvent = (req, res) => {
    var id = req.body.id;
    var Activity = req.body.Text;
    var Comments = req.body.Comments;
    var TaskType = req.body.TaskType;
    var Items = req.body.Items;
    var Duration=req.body.Duration;
    var End=req.body.End;
    var UpdatedID=req.body.UpdatedByID;
    var UpdatedOn=req.body.UpdatedOn;
	var TimeSheetID=req.body.TimeSheetid;
 

    TeamLeadTimeSheet.update(
        { _id: id },
        {
            $set: {
                Text: Activity,
                Comments: Comments,
                TaskType: TaskType,
                Items: Items,
                Hours:Duration,
                End:End,
				TimeSheetID:TimeSheetID,
                UpdatedByID:UpdatedID,
                UpdatedOn:UpdatedOn
            }
        }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });



}


exports.GetEvent = (req, res) => {
    var Text1 = req.params.Text;
    var Date = req.params.Date;
    TeamLeadTimeSheet.find({ Text: Text1,StartDate:Date }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetEvent1 = (req, res) => {
    var Text1 = req.params.Text;
    var Date = req.params.Date;
	var UserName = req.params.UserName;
    var TimeSheetID= req.params.TimeSheetID;
    TeamLeadTimeSheet.find({ Text: Text1,StartDate:Date,UserName:UserName,TimeSheetID:TimeSheetID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTeamLeadTimeSheet = (req, res) => {
    var StartDate=req.params.Date;
    var TaskID = req.params.id;
    var FacilityID = req.params.FacilityService;

 
    TeamLeadTimeSheet.find({StartDate:StartDate, TaskID: TaskID,FacilityID:FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.ChkTeamLeadTimeSheet = (req, res) => {
    var StartDate=req.params.Date;
    var UserName = req.params.UserName;
    var FacilityID = req.params.FacilityService;
    var ProjectNameID = req.params.ProjectNameID

 
    TeamLeadTimeSheet.find({StartDate:StartDate, UserName: UserName,FacilityID:FacilityID,ProjectID:ProjectNameID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTeamLeadTimeSheet1 = (req, res) => {
    var ID = req.params.GetID;
    var FacilityID = req.params.FacilityService;

 
    TeamLeadTimeSheet.find({ _id: ID,FacilityID:FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};




exports.updateTeamLeadTimeSheet = (req, res) => {
    var id = req.body.ID;
    var TaskType = req.body.TaskType;
    var Items = req.body.Items;
    var Phase = req.body.phase;
    var Comments = req.body.Comments;
    var Hours = req.body.Hours;
    
    var UpdatedByID=req.body.UpdatedByID;
    var UpdatedOn=req.body.UpdatedOn;

    console.log(UpdatedByID)
    TeamLeadTimeSheet.update({ _id: id }, {
        $set: {
            TaskType: TaskType,
            Items: Items,
            phase: req.body.phase,
            Comments: Comments,
            Hours: Hours,
            UpdatedOn:UpdatedOn,
            UpdatedByID:UpdatedByID
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


exports.UpdateTeamLeadTimeSheetPublish = (req, res) => {
    var StartDate = req.body.StartDate;
    
    var Publish = req.body.Publish;
    var PublishedTime = req.body.PublishedTime;
  



    TeamLeadTimeSheet.update(
        { StartDate: StartDate },
        {
            $set: {
                Publish: 1,
                PublishedTime:PublishedTime
            }
        },
        {  multi: true }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });

}



exports.GetTeamLeadTimeSheetFull = (req, res) => {
 
    var GetUserName = req.params.GetUserName;
    var FacilityID = req.params.FacilityService;

 
    TeamLeadTimeSheet.find({UserName: GetUserName,FacilityID:FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};
exports.GetTeamLeadTimeSheetFullAdd = (req, res) => {
 
    var GetUserName = req.params.GetUserName;
    var FacilityID = req.params.FacilityService;
var Date1=req.params.Date1;
 
    TeamLeadTimeSheet.find({UserName: GetUserName,FacilityID:FacilityID,StartDate:Date1 }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};
exports.GetActualHoursFromTeamLeadTimesheet = (req, res) => {
    
       var ProjectID = req.params.GridProjectID;
       var FacilityID = req.params.FacilityService;
   
    
       TeamLeadTimeSheet.find({ProjectID: ProjectID,FacilityID:FacilityID,Publish:1 }, function (err, docs) {
           if (err) {
               console.log(err);
           }
           res.json(docs);
       });
   };