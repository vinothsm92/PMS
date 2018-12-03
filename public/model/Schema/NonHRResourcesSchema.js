var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    ResourceName: String,
    FacilityID: String,
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now }
}, { versionKey: false });
var NHRResource = mongoose.model("pms_NonHRResources", Schema);




exports.AddNHR = (req, res) => {
    debugger;
    NewNHRResource = new NHRResource(req.body);

    NewNHRResource.save(function (err, doc) {
        res.json(doc);
    });
};

exports.getNHRResource = (req, res) => {
    debugger;
    var FacilityID = req.params.FacilityService;
    NHRResource.find({FacilityID:FacilityID}, { 'ResourceName': 1 }, function (err, docs) {
        res.json(docs);
    });
};
