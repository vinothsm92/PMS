
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Schema = new Schema({
    ClientName: String,
    ContactPerson: String,
    EmailID: String,
    ClientLocation: String,
    PhoneNumber: Number,
    OtherInfo: String,
    CreatedById: String,
    FacilityID: String,
    IsActive: Boolean,
    ClientName:String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });



var NewClient = mongoose.model("pms_clientdetails", Schema);

exports.AddClientDetails = (req, res) => {


    NewClients = new NewClient(req.body);

    NewClients.save(function (err, doc) {
        if (err) {
            res.json(err);
        } else {
            res.json(doc);
        }


    });
};


exports.GetClientDetails = (req, res) => {
    FacilityID = req.params.FacilityService;
    NewClient.find({ IsActive: true, FacilityID: FacilityID }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
};

exports.DeleteClientDetails = (req, res) => {

    var id = req.params.DeleteClientMasterKey;
    NewClient.update({ _id: id }, { $set: { IsActive: false } },
        function (err, doc) {
            if (err) {
                console.log(err);
            }
            res.json(doc);
            return doc;
        }
    );

}

exports.GetUpdateClientDetails = (req, res) => {

    var id = req.params.id;
    var Fid = req.params.FacilityService;
    NewClient.find({ _id: id, FacilityID: FacilityID, IsActive: true }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });


}


exports.UpdateClientDetails = (req, res) => {
    var id = req.body.id;
    var ClientName = req.body.ClientName;
    var ContactPerson = req.body.ContactPerson;
    var EmailID = req.body.EmailID;
    var ClientLocation = req.body.ClientLocation;
    var PhoneNumber = req.body.PhoneNumber;
    var OtherInfo = req.body.OtherInfo;
    var UpdatedById = req.body.UpdatedById;
    var FacilityID =  req.body.FacilityID;
    var IsActive = true;
    NewClient.update({ _id: id }, {
        $set: {
            ClientName: ClientName
            , ContactPerson: ContactPerson,
            EmailID: EmailID,
            ClientLocation: ClientLocation,
            OtherInfo: OtherInfo,
            UpdatedById: UpdatedById,
            PhoneNumber:PhoneNumber,
            FacilityID: FacilityID,
            IsActive: IsActive,
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



exports.GetClientNameforproject = (req, res) => {
    FacilityID = req.params.FacilityService;
    

    NewClient.find({IsActive: true, FacilityID: FacilityID}).sort({ 'ClientName': 1 }).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};