
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    FacilityName: String,
    Address: String,
    Country: String,
    State: String,
    City: String,
    IsActive: Boolean,
    Region: String,
    Area: String,
    Postal_Code: Number,
    Contact_Person: String,
    Contact_Email: String,
    
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });


var newFacility = mongoose.model("pms_Facility", Schema);

exports.AddFacility = (req, res) => {
    NewFacility = new newFacility(
        {

            FacilityName: req.body.FacilityName,
            Address: req.body.Address,
            Country: req.body.Country,
            State: req.body.State,
            City: req.body.City,
            IsActive: req.body.IsActive,
            Region: req.body.Region,
            Area: req.body.Area,
            Postal_Code: req.body.Postal_Code,
            Contact_Person: req.body.Contact_Person,
            Contact_Email: req.body.Contact_Email,
            Late_trays_on_DumbWaiters: req.body.Late_trays_on_DumbWaiters,
            CreatedById: req.body.CreatedById,
            UpdatedById: ''

        }
    );

    NewFacility.save(function (err, doc) {
        if (err) {
            console.log(err);
            res.json(err);

        }
        res.json(doc);
    });
};





exports.ShowFacility = (req, res) => {
    newFacility.find({}, function (err, docs) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        res.json(docs);
    });
};




// exports.ShowMasterFacilityDropDown = (req, res) => {
//     newFacility.find({},{FacilityName:1}, function (err, docs) {

//         res.json(docs);

//     });
// };




exports.ShowFacilityID = (req, res) => {
    newFacility.find({}, { FacilityName: 1 }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};





exports.ShowFacilityName = (req, res) => {

    newFacility.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.UpdateFacility = (req, res) => {
    var id = req.params.id;
    var FacilityName = req.params.FacilityName;
    var Address = req.params.Address;
    var IsActive = req.params.IsActive;
    var Region = req.params.Region;
    var Area = req.params.Area;
    var Postal_Code = req.params.Postal_Code;
    var Contact_Person = req.params.Contact_Person;
    var Contact_Email = req.params.Contact_Email;
    var UpdatedById = req.params.UpdatedById;
    newFacility.update({ _id: id }, {
        $set: {
            FacilityName: FacilityName, Address: Address, IsActive: IsActive,
            Region: Region, Area: Area, Postal_Code: Postal_Code, Contact_Person: Contact_Person,
            Contact_Email: Contact_Email,
            UpdatedById: UpdatedById
        }
    },
        function (err, doc) {
            if (err) {
                console.log(err);
            }

            res.json(doc);
            //    return res.send(204);

        }
    );
};



// exports.DeleteFacility = (req, res) => {

//     var id = req.params.Facilitykeyid;
//     newFacility.findByIdAndRemove(id)
//         .exec()
//         .then(function (err, doc) {
//             if (err) {
//                 console.log(err);
//             }
//             res.json(doc);
//         });
// }




exports.ViewUpdateFacilityDetails = (req, res) => {
    id = req.params.FacilityID;
    newFacility.find({ _id: id }, function (err, docs) {
        if (err) {
            console.log(err);
        }

        res.json(docs);


    });
};



exports.UpdateFacilityValues = (req, res) => {
    newFacility.update({ _id: req.body.FacilityId },
        {
            $set: {
                FacilityName: req.body.FacilityName,
                Address: req.body.Address,
                Country: req.body.Country,
                State: req.body.State,
                City: req.body.City,
                IsActive: req.body.IsActive,
                Region: req.body.Region,
                Area: req.body.Area,
                Postal_Code: req.body.Postal_Code,
                Contact_Person: req.body.Contact_Person,
                Contact_Email: req.body.Contact_Email,
                Late_trays_on_DumbWaiters: req.body.Late_trays_on_DumbWaiters,
                UpdatedById: req.body.UpdatedById


            }
        },
        function (err, doc) {
            if (err) {
                console.log(err);
            }

            res.json(doc);
            //    return res.send(204);

        }
    );
};