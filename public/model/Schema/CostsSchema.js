var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    ResourceID: String,
    ResourceType: String,
    Month: String,
    Year: Number,
    Amount: Number,
    FacilityID: String,
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
}, { versionKey: false });

var Costs = mongoose.model("pms_Costs", Schema);

exports.RemoveResourceCost = (req, res, next) => {
    
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var ResourceType = req.params.ExpenseID;
    var FacilityID = req.params.FacilityService;
    Costs.collection.remove({ Month: Month, Year: Year, ResourceType: ResourceType, FacilityID: FacilityID }, function (err) {
        if (err) throw err;
        else return next();
        // collection is now empty but not deleted
    });
};

exports.AddResourceCost = (req, res) => {
    
    req.body.forEach(function (obj) {
        obj.UpdatedOn = Date();
        delete obj._id;

    });
    Costs.collection.insert(req.body, onInsert);

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

exports.getCost = (req, res) => {
  
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var ResourceType = req.params.ExpenseID;
    var FacilityID = req.params.FacilityService;
    Costs.find({ Month: Month, Year: Year, ResourceType: ResourceType, FacilityID: FacilityID }, function (err, docs) {
        res.json(docs);
    });

};
exports.GetResourceSalary = (req, res) => {
    


    var FacilityID = req.params.FacilityService;
    Costs.find({ FacilityID: FacilityID, ResourceType: "HRB" }, function (err, docs) {
        res.json(docs);
    });

};



exports.getTotalExpense = (req, res) => {
   
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var ResourceType = req.params.ExpenseID;
    var FacilityID = req.params.FacilityService;


    Costs.find({ FacilityID: FacilityID, Month: Month, Year: Year, }, function (err, docs) {
        res.json(docs);
    });

};

exports.getTotalBillableExpense = (req, res) => {
    
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);

    var FacilityID = req.params.FacilityService;


    Costs.find({ FacilityID: FacilityID, Month: Month, Year: Year, ResourceType: "HRB" }, function (err, docs) {
        res.json(docs);
    });

};

exports.getAllCost = (req, res) => {
    
 


    Costs.find({}, function (err, docs) {
        res.json(docs);
    });

};

exports.GetLoadedCostCalc = (ResourceType, Month, UserID, Year) => {
    return new Promise(function (resolve, reject) {


        Costs.find({ ResourceType: ResourceType, Month: Month, UserID: UserID, Year: Year }, function (err, docs) {
            if (err) {
                reject(new Error('Ooops, something broke!', err));
                return;
            }
            resolve(docs);
        });
    })



};

exports.GetLoadedCostCalcMonth = (ResourceType, Month, Year) => {
    return new Promise(function (resolve, reject) {

        Costs.aggregate({ "$match": { ResourceType: ResourceType, Month: Month, Year: Year } },
            { $group: { _id: null, sum: { $sum: "$Amount" } } },
            { $project: { _id: 0, sum: 1 } }
            , function (err, docs) {
                resolve(docs);
                if (err) {
                    reject(new Error('Ooops, something broke!', err));
                    return;
                }

            });
    })



};


exports.GettotalExpenseValues = (req, res) => {
    
    var Month = req.params.Month;
    var Year = parseInt(req.params.Year);
    var FacilityID = req.params.FacilityService;
    // Costs.find({ Month: Month, Year: Year, FacilityID:FacilityID}, function (err, docs) {
    //     res.json(docs);
    // });


    Costs.aggregate([

        { "$match": { FacilityID: FacilityID, Month: Month, Year: Year } },
        { "$group": { _id: 'UserName', Amount: { $sum: "$Amount" } } },
        { "$project": { UserName: "$UserName", Amount: "$Amount", _id: 0 } }], function (err, docs) {
            res.json(docs);
            if (err) {
                console.log(err);
            }

        });



};

exports.GetResourceLoadedCostFromExpense = (req, res) => {
    


    var FacilityID = req.params.FacilityService;
    Costs.find({ FacilityID: FacilityID, ResourceType: "HRB" }, function (err, docs) {
        res.json(docs);
    });

};