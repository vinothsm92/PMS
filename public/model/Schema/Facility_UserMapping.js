
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    FacilityID: String,
    UserID: String,
    UserName: String,
    IsActive: Boolean,
    Assignedin: Boolean,
    CreatedById: String,
    
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });

var FacilityUserMapping = mongoose.model("pms_Facility_User_Mapping", Schema);

exports.SaveFacility_UserMappingTable = (req, res) => {

    var FacilityId = req.params.facilityId;
    var UserId = req.params.userid;
    var IsActive = req.params.Isactive;

    FacilityMappingtable = new FacilityUserMapping({
        FacilityID: FacilityId,
        UserID: UserId,
        UserName:UserId,
        IsActive: IsActive,
        Assignedin: true,
        CreatedById: UserId,
        UpdatedById: UserId

    });

    FacilityMappingtable.save(function (err, doc) {
        if (err) {
            console.log(err);
        }

        res.json(doc);
        // return res.send(204);

    }
    );
}







exports.UpdateFacilityUserMappingAssignedFalse = (req, res) => {
    var id = req.params.id;
    var FacilityId = req.params.facilityId;
    var UserId = req.params.userid;
    var IsActive = req.params.Isactive;
    FacilityUserMapping.update({ _id: id }, {
        $set: {

            IsActive: IsActive,
            Assignedin: false,
            UpdatedById: UserId

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

exports.Checkfacilitybyuser = (req, res) => {
    var FacilityID = req.params.FacilityID;
    var UserID = req.params.username;
    
    FacilityUserMapping.find({FacilityID:FacilityID,UserID:UserID,IsActive : true}, function (err, docs) {
        if (err) {
            console.log(docs);
            res.json(err);
        }
        res.json(docs);
    });
};

exports.UpdateFacility_UserMappingTable = (req, res) => {
    var id = req.params.id;
    var FacilityId = req.params.facilityId;
    var UserId = req.params.userid;
    var IsActive = req.params.Isactive;
    FacilityUserMapping.update({ _id: id }, {
        $set: {

            IsActive: IsActive,
            Assignedin: true,
            UpdatedById: UserId

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



exports.ViewUserMapping = (req, res) => {
    facilityId = req.params.FaclityId;
    FacilityUserMapping.find({ FacilityID: facilityId, Assignedin: true }, function (err, docs) {
        if (err) {
            console.log(err);
        }

        res.json(docs);
    });

    
};

exports.UserResource = (req, res) => {
    var FacilityID=req.params.FacilityService;

    FacilityUserMapping.find({  IsActive: true,Assignedin:true,FacilityID:FacilityID }).sort({ 'UserName': 1 }).exec(function (err, docs) {
        if (err) {
            console.log(err);
        }
        res.json(docs);
    });
    // FacilityUserMapping.find({ IsActive: true,Assignedin:true,FacilityID:FacilityID}).sort({'UserName':1}, function (err, docs) {
    //     res.json(docs);
    // });
};


exports.GetUserMappingTableValues = (req, res) => {
    facilityidValue = req.params.facilityidValue;

    FacilityUserMapping.find({ $or: [{ FacilityID: facilityidValue }, { FacilityID: '0' }] }
        , function (err, docs) {
            if (err) {
                console.log(err);
            }

            res.json(docs);
        });
};










exports.ViewFacilityUser = (req, res) => {

   

        FacilityUserMapping.find({FacilityID: '0', Assignedin: true }).sort({ 'UserID': 1 }).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};


exports.getuseridvalue = (req, res) => {

    FacilityUserMapping.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        }

        res.json(docs);

    });
};



exports.GetFacilityIDFromFacilityUserMapping = (req, res) => {

    UserId = req.params.LoggedinUsers;
    FacilityUserMapping.find({ UserID: UserId, IsActive: true }, { FacilityID: 1, _id: 0 }, function (err, docs) {
        if (err) {
            console.log(err);
        }

        res.json(docs);

    });
};



exports.SaveUserIDAndIsActive = (req, res, next) => {
    var userid = req.params.CurrentUserId;

    FacilityMappingtable = new FacilityUserMapping({

        FacilityID: 0,
        UserID: userid,
        IsActive: false,
        Assignedin: true,
        CreatedById: userid,
        UpdatedById: userid
    });
    FacilityMappingtable.save(function (err, doc) {
        if (err) {
            console.log(err);
        }

        res.json(doc);
        // return res.send(204);

    }

    );
}




exports.UpdateFacilityMapping = (req, res) => {

    var User = req.params.CurrentUserId;

    FacilityUserMapping.update({ _id: User }, {
        $set:
        {

            Assignedin: false
        }
    },
        function (err, doc) {
            if (err) {
                console.log(err);

            }


            res.json(doc);
            // console.log(doc);
            //    return res.send(204);

        }
    );
};



exports.UpdateUserIDInFacilityMapping = (req, res) => {

    var User = req.params.CurrentUserId;

    FacilityUserMapping.update({ _id: User }, {
        $set:
        {
            Assignedin: true
        }
    },
        function (err, doc) {
            if (err) {
                console.log(err);

            }
            res.json(doc);
            //   console.log(doc);
            //    return res.send(204);

        }
    );
};














