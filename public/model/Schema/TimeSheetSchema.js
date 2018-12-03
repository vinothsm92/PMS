
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    Text: String,
    Start: String,
    StartDate: String,
    End: String,
    Hours: Number,
    ActualDate:String,
    Phase: String,
    Resource: String,
    ProjectID: [{ type: Schema.ObjectId, ref: 'pms_projectdetails' }],
    UserName: String,
    Comments: String,
    Publish: Number,
    TaskType: String,
    Items: String,
    FacilityID: String,
    TaskID: [{ type: Schema.ObjectId, ref: 'pms_ManageTask' }],
    TaskDescription: String,
    CreatedOn: String,
    FacilityID: String,
    UpdatedOn: String,
    CreatedByID: String,
    UpdatedbyID: String,
    APIDateFiler:{ type: Date }
},
    { versionKey: false });

var NewTask = mongoose.model("pms_TimeSheet", Schema);

exports.AddTimeSheet = (req, res) => {

    NewTask.collection.insert(req.body, onInsert);

    function onInsert(err, docs) {
        if (err) {
            console.log(err);

        } else {

            res.json(docs);
        }
    }
};

exports.GetEvent = (req, res) => {
    var GetEventID = req.params.GetTimeSheeetID;
    NewTask.find({ _id: GetEventID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetTimeSheet = (req, res) => {
    FacilityID = req.params.FacilityService;
    username = req.params.username;
    ProjectID = req.params.ProjectID;
    NewTask.find({ UserName: username, FacilityID: FacilityID, ProjectID: ProjectID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTimeSheetforProj = (req, res) => {
    FacilityID = req.params.FacilityService;
    username = req.params.username;

    NewTask.find({ UserName: username, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.GetTimeSheet1 = (req, res) => {
    FacilityID = req.params.FacilityService;
    username = req.params.username;

    NewTask.find({ UserName: username, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};
exports.Getpublished = (req, res) => {
    var id = req.params.id;

    NewTask.find({ _id: id }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.Getpublished1 = (req, res) => {
    var StartDate = req.params.StartDate;

    NewTask.find({ StartDate: StartDate }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.UpdataEvent = (req, res) => {
    var id = req.body.id;
    var Activity = req.body.Text;
    var Comments = req.body.Comments;
    var TaskType = req.body.TaskType;
    var Items = req.body.Items;
    var Duration = req.body.Duration;
    //var End=req.body.End;
    var UpdatedID = req.body.UpdatedByID;
    var UpdatedOn = req.body.UpdatedOn;

    NewTask.update(
        { _id: id },
        {
            $set: {
                Text: Activity,
                Comments: Comments,
                TaskType: TaskType,
                Items: Items,
                Hours: Duration,
                // End:End,
                UpdatedbyID: UpdatedID,
                UpdatedOn: UpdatedOn
            }
        }, function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.json(docs);
        });



}

// exports.UpdateTimeSheet = (req, res) => {
//     var StartDate = req.body.StartDate;
//     var year = StartDate.substring(0, 4);
//     var month = StartDate.substring(5, 7);
//     var date = StartDate.substring(8, 10);
//     var fulldate = date + '-' + month + '-' + year;
//     var Publish = req.body.Publish;
//     var UserName=req.body.UserName;





//     NewTask.update(
//         { StartDate: fulldate,UserName:UserName },
//         {
//             $set: {
//                 Publish: Publish,
// 				UpdatedOn:req.body.UpdatedOn,
// 				UpdatedbyID:req.body.UpdatedbyID
//             }
//         },
//         {  multi: true }, function (err, docs) {
//             if (err) {
//                 console.log(err);
//             }
//             res.json(docs);
//         });

// }
exports.UpdateTimeSheet = (req, res) => {
    var StartDate = req.body.StartDate;

    var fulldate = StartDate;
    var Publish = req.body.Publish;
    var UserName = req.body.UserName;





    NewTask.update(
        { StartDate: fulldate, UserName: UserName },
        {
            $set: {
                Publish: Publish,
                UpdatedOn: req.body.UpdatedOn,
                UpdatedbyID: req.body.UpdatedbyID
            }
        },
        { multi: true }, function (err, docs) {
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
    var Hours = req.body.Hours;


    NewTask.update({ _id: id }, {
        $set: {

            Start: Start, End: End, Hours: Hours

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


exports.TimeSheetPublishedReport = (req, res) => {


    FacilityID = req.params.FacilityService;
    username = req.params.UserName;
    ProjectID = req.params.ProjectNameID;
    NewTask.aggregate([

        //where query
        { "$match": { UserName: username, FacilityID: FacilityID, ProjectID: ProjectID, Publish: 1 } },
        //distinct column 
        {
            "$group": {
                _id: {
                    ProjectID: "$ProjectID", Task: "$Text", Phase: "$phase", Comments: "$Comments", TaskType: "$TaskType", Items: "$Items", UserName: "$UserName",
                    IsBillable: "$IsBillable", Date: "$StartDate"
                }, Hours: { $sum: "$Hours" }
            }
        },
        //provide column name for the output
        {
            "$project": {
                _id: 0, ProjectID: "$_id.ProjectID", Phase: "$_id.Phase", Task: "$_id.Task", Comments: "$_id.Comments", TaskType: "$_id.TaskType", Items: "$_id.Items",
                UserName: "$_id.UserName", IsBillable: "$_id.IsBillable", Date: "$_id.Date", Hours:  {$divide: [ "$Hours", 1 ]}
            }
        }
    ], function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

//added
exports.GetTimeSheetSelectedDate = (req, res) => {
    FacilityID = req.params.FacilityService;
    username = req.params.username;
    ProjectID = req.params.ProjectID;
    SDate = req.params.Date;
    TaskID = req.params.TaskID;


    NewTask.find({ UserName: username, FacilityID: FacilityID, ProjectID: ProjectID, ActualDate: SDate, TaskID: TaskID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetBillableTimeSheet = (req, res) => {
  

    NewTask.find({  Publish: 1  }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};


exports.GetPMSUserTimeSheet = (req, res) => {
   

    var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
       day = beforeOneWeek.getDay();
        diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
        lastMonday = new Date(beforeOneWeek.setDate(diffToMonday));
        lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
        
        var dd=0;
        var mm=0;
        var yy=0;
        
        function formatDate(timestamp){
            var x=new Date(timestamp);
             dd = x.getDate();
             mm = x.getMonth();
             yy = x.getFullYear();
            return dd +"-" + mm+"-" + yy;
         }
        LMonday=(formatDate(lastMonday));
        const startDate = new Date(yy,mm,dd);
        LSunday=(formatDate(lastSunday));
        
        function getDates(startDate, endDate, interval) {
    const duration = endDate - startDate;
    const steps = duration / interval;
    return Array.from({length: steps+1}, (v,i) => new Date(startDate.valueOf() + (interval * i)));
    }
    
    
    
    const endDate = new Date(yy,mm,dd);
    const dayInterval = 1000 * 60 * 60 * 24; // 1 day
    
    var date= getDates(startDate, endDate, dayInterval);
    var alldates=[]
    a=0;
    for(i=0;i<date.length;i++){
       function formatDate(timestamp){
            var x=new Date(timestamp);
            var dd = x.getDate();
            var mm = x.getMonth()+1;
            var yy = x.getFullYear();
            return dd +"-" + mm+"-" + yy;
         }
        console.log(formatDate(date[i]));

        NewTask.find({StartDate:formatDate(date[i])}).populate('ProjectID', ['ProjectName']).populate('TaskID', ['TaskDescription']).exec( function (err, docs) {
            if (err) {
                console.log(err);
            }
            a=a+1;
           if(docs.length>0){
               for(k=0;k<docs.length;k++){
                alldates.push(docs[k]);
               }
           }
           
            if(a==7){
                res.json(alldates);  
            }
        });
    
    }
  
};