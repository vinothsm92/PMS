var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    Week : String,
    StartDate : String,
    EndDate : String,
    ProjectName :String,
    PlannedEfforts : Number,
    ActualEfforts : Number,
    PlannedRevenue : Number,
    ActualRevenue : Number,
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    FacilityID: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });


var NewMarginReport = mongoose.model("pms_MarginReportTemplate", Schema);

exports.AddReport = (req, res) => {


    return new Promise(function (resolve, reject) {
        NewMarginReport.collection.insert(req, onInsert);

        function onInsert(err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                return;
            } else {
                //console.info('successfully stored.', docs.length);
                resolve(docs);
            }
        }
    })


};

exports.GetWeekNo = (ProjName, FromDate) => {
    return new Promise(function (resolve, reject) {
        NewMarginReport.find({ }, function (err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                    return;
            }
            resolve(docs);
        });
    })
    
};
exports.GetMarginReportData = (req, res) => {
  
    NewMarginReport.find({ }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};