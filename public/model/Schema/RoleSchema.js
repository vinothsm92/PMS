
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Schema = new Schema({
    RoleName: String,
    Description: String,
    ProjectViewInfoRights:String,
    IsProjectAssignmentRequired:Boolean,
    IsActive: Boolean,
    UIList: [{
        UiName: String,
        View: Boolean,
        Edit: Boolean
    }],
    CreatedById: String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById: String,
    UpdatedOn: { type: Date, default: Date.now }
},
    { versionKey: false });




var newRole = mongoose.model("pms_Role", Schema);

exports.AddNewRole = (req, res) => {


    NewRole = new newRole(
        {
            RoleName: req.body.RoleName,
            Description: req.body.Description,
            IsActive: req.body.IsActive,
            ProjectViewInfoRights: req.body.projectviewRights,
            IsProjectAssignmentRequired: req.body.projectpassignmentRequired,
            CreatedById: req.body.CreatedById,
            UpdatedById: '',

            UIList: [{
                "UiName": "Manage Role",
                "View": false,
                "Edit": false

            },
            {
                "UiName": "Manage User",
                "View": false,
                "Edit": false

            },
            {
                "UiName": "Manage Facility",
                "View": false,
                "Edit": false

            },
             {
                "UiName": "Enterprise Configuration",
                "View": false,
                "Edit": false

            },
             {
                "UiName": "Expenses",
                "View": false,
                "Edit": false

            },
             {
                "UiName": "Client Configuration",
                "View": false,
                "Edit": false

            },
             {
                "UiName": "Project Definition",
                "View": false,
                "Edit": false

            },
             {
                "UiName": "Manage Team",
                "View": false,
                "Edit": false

            },
            {
               "UiName": "Manage Task",
               "View": false,
               "Edit": false

           },
           {
            "UiName": "Time Sheet",
            "View": false,
            "Edit": false

        },
        {
            "UiName": "Team Lead Time Sheet",
            "View": false,
            "Edit": false

        },
        {
            "UiName": "Configurable Item",
            "View": false,
            "Edit": false

        },
        {
            "UiName": "TimeSheet Report",
            "View": false,
            "Edit": false

        }, 
        {
            "UiName" : "Utilisation Report",
            "View" : false,
            "Edit" : false,
           
        }

            ]
        })

    NewRole.save(function (err, doc) {

        if (err) {
            //  console.log("Error Occured");
            console.error(err);
            res.json(err);

        }

        res.json(doc);
        // res.send('Successfully inserted!');

    });
};

exports.ShowRoleDropDown = (req, res) => {

    newRole.find({ IsActive: true }, { RoleName: 1, IsActive: 1 }, function (err, docs) {
        if (err) {
            //  console.log("Error Occured");
            console.log(err);
        }

        res.json(docs);

    });

};


exports.ShowRole = (req, res) => {

    newRole.find({}).sort({ '_id': -1 }).exec(function (err, docs) {
        if (err) {
            // console.log("Error Occured");
            console.log(err);
        }

        res.json(docs);


    });
};




exports.GetActiveResourceType = (req, res) => {

    newRole.find({IsActive:true}).sort({ '_id': -1 }).exec(function (err, docs) {
        if (err) {
            // console.log("Error Occured");
            console.log(err);
        }

        res.json(docs);


    });
};




exports.GetInActiveResourceType = (req, res) => {

    newRole.find({IsActive:false}).sort({ '_id': -1 }).exec(function (err, docs) {
        if (err) {
            // console.log("Error Occured");
            console.log(err);
        }

        res.json(docs);


    });
};


exports.UpdateManageRole = (req, res) => {


    var id = req.body.id;
    var RoleName = req.body.rolename;
    var Description = req.body.description;
    var IsActive = req.body.isactive;
    var ProjectViewInfoRights = req.body.projectviewRights;
    var IsProjectAssignmentRequired = req.body.projectassignmentRequired;
    var updatedBy = req.body.updatedBy;


    newRole.update({ _id: id }, {
        $set: {
            RoleName: RoleName,
            Description: Description,
            IsActive: IsActive,
            ProjectViewInfoRights: ProjectViewInfoRights,
            IsProjectAssignmentRequired: IsProjectAssignmentRequired,
            UpdatedById: updatedBy

        }
    },
        function (err, doc) {
            if (err) {
                // console.log("Error occured");
                console.log(err);

            }

            res.json(doc);
            // console.log("Updated successfully");
            //    return res.send(204);

        }
    );
};

exports.UpdateRoleName = (req, res) => {

    var id = req.params.id;
    var RoleName = req.params.rolename;
    newRole.update({ _id: id }, { $set: { RoleName: RoleName } },
        function (err, doc) {
            if (err) {
                // console.log("Error occured");
                console.log(err);
            }

            res.json(doc);
            //    return res.send(204);

        }
    );
}


exports.RoleViewEditupdate = (req, res) => {

    var id = req.params.id;
    var UIName = req.params.uiname;
    var VIEW = req.params.view;
    var EDIT = req.params.edit;
    newRole.update
        (
        {
            _id: id,
            "UIList.UiName": UIName
        },
        {
            $set: {
                "UIList.$.View": VIEW,
                "UIList.$.Edit": EDIT
            }
        },
        function (err, doc) {
            if (err) {
                //console.log("Error occured");
                console.log(err);
            }
            else

                res.json(doc);

        }
        );
};

exports.PageView = (req, res) => {

    var roleid = req.params.RoleID;

    newRole.find({ _id: roleid }, function (err, docs) {
        if (err) {
            //  console.log("Error occured");
            console.log(err);
        }

        res.json(docs);


    });
}

exports.ShowRoleDatapopup = (req, res) => {

    var id = req.params.id;
    newRole.find({ _id: id }, function (err, docs) {
        if (err) {
            // console.log("Error occured");
            console.log(err);
        }

        res.json(docs);


    });
};