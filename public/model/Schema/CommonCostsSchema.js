var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    DaysPAnnum: Number,
    HourPDay: Number,
    ExchangeRate: Number,
    Month: String,
    Year: Number,
    FacilityID: String,
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
}, { versionKey: false });

var CommonCosts = mongoose.model("pms_CommonCosts", Schema);

exports.RemoveCommonCost = (req, res, next) => {
    debugger;
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var FacilityID = req.params.FacilityService;
    CommonCosts.collection.remove({ Month: Month, Year: Year , FacilityID: FacilityID }, function (err) {
        if (err) throw err;
        else return next();
        // collection is now empty but not deleted
    });
};

exports.AddCommonCost = (req, res) => {
    debugger;
    
    CommonCosts.collection.insert(req.body, onInsert);
    function onInsert(err, docs) {
        if (err) {
            console.log(err);
            // TODO: handle error
        } else {
            // console.info('successfully stored.', docs.length);
            res.json("successfully stored.");
        }
    }
};

exports.getCommonCost = (req, res) => {
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var FacilityID = req.params.FacilityService;  
  
    CommonCosts.find({ Month: Month, Year: Year, FacilityID:FacilityID }, function (err, docs) {
        res.json(docs);
    });

};