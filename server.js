
var express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const expressValidator = require('express-validator');
var app = express();
var multer = require('multer');
var request = require('request');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
//test branch
var fs = require('fs')

dotenv.load({ path: '.env.Config' });

app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '\\public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', () => {
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});




/**
 * Controllers (route handlers).
 */
const userController = require('./public/controller/user');
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./public/config/passport');
/**
 * Create Express server.
 */

var ManageRoleConfig = require('./public/model/Schema/RoleSchema');
var Facility_UserMappingConfig = require('./public/model/Schema/Facility_UserMapping');
var ManageFacilityConfig = require('./public/model/Schema/FacilitySchema');
var CountryConfig = require('./public/model/Schema/CountrySchema');
var StateConfig = require('./public/model/Schema/StateSchema');
var CityConfig = require('./public/model/Schema/CitySchema');
var ConfigureItems = require('./public/model/Schema/ConfigureItemsSchema');
var ClientConfig = require('./public/model/Schema/ClientDetailSchema');
var ManageprojectConfig = require('./public/model/Schema/ManageProjectSchema');
var CostConfig = require('./public/model/Schema/CostsSchema');
var CommonCostConfig = require('./public/model/Schema/CommonCostsSchema');
var NHRConfig = require('./public/model/Schema/NonHRResourcesSchema');
var ManageTeamConfig = require('./public/model/Schema/ManageTeamSchema');
var ManageTaskConfig = require('./public/model/Schema/ManageTaskSchema');
var TimeSheetConfig = require('./public/model/Schema/TimeSheetSchema');
var TeamLeadTimeSheetConfig = require('./public/model/Schema/TeamLeadTimeSheetSchema');
var ProjectMapping = require('./public/model/Schema/ProjectMapping');
var MarginReportTemplate = require('./public/model/Schema/MarginReportTemplateSchema');
//app.use(express.static(__dirname + "/public"));


app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true
    })
}));

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 200000 }));
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());


app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/EmailConfirmation/:token', userController.getEmailConfirmation);
app.get('/index1', passportConfig.isAuthenticated);
app.get('/logout', function (req, res) {
    req.logout();
    res.json("logout");
});



app.get('/loggedin', function (req, res) {

    res.send(req.isAuthenticated() ? req.user.UserName : '0');

});











// *** Enterprise config start ***


app.put('/registerConfirmationMailContent', function (req, res) {
    fs.writeFile('./public/MailContents/registerConfirmationmail.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        // console.log("New Registration file was updated!");
    });
});

app.put('/ApprovedUserMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/EmailForApprovedUser.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Approved user file was updated!");
    });
});


app.put('/RejectedUserMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/EmailForRejectedUser.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        // console.log("Rejected user file was updated!");
    });
});

app.put('/forgotMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/forgotMailContent.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Forget password Mail file was updated!");
    });
});

app.put('/EmailContentUpdateForTestMail', function (req, res) {
    fs.writeFile('./public/MailContents/TestMail.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Test Mail file was updated!");
    });
});

app.put('/TeamAllocationMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/TeamAllocation.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Test Mail file was updated!");
    });
});


app.put('/ProjectAllocationMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/EmailForProjectAllocation.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Test Mail file was updated!");
    });
});






app.put('/AdminEmailForNewUserMailContentUpdate', function (req, res) {
    fs.writeFile('./public/MailContents/AdminEmailForNewUser.html', req.body.result, function (err) {
        if (err) {
            return console.log(err);
        }

        //  console.log("Test Mail file was updated!");
    });
});



app.put('/updateEmailSubjectsjson/', function (req, res) {
    fs.writeFile('./public/PMSConfig/EmailSubjects.json', JSON.stringify(req.body.value, undefined, 2), 'utf8',
        function (err, value) { if (err) { console.log(err); }; res.send(value); });
});


app.put('/updateEnterPriseInfojson/', function (req, res) {
    fs.writeFile('./public/PMSConfig/EnterpriseConfiguration.json', JSON.stringify(req.body.value, undefined, 2), 'utf8',
        function (err, value) { if (err) { console.log(err); }; res.send(value); });
});


app.put('/updateSMTPConfigurationjson/', function (req, res) {
    fs.writeFile('./public/PMSConfig/MailConfiguration.json', JSON.stringify(req.body.value, undefined, 2), 'utf8',
        function (err, value) { if (err) { console.log(err); }; res.send(value); });
});


app.put('/SendMail', userController.SendTestMailtoUser);



var valuname = "";
var storages = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/LogoUploads');

    },
    filename: function (req, file, cb, res) {
        //console.log(req.config.data.file.name);
        cb(null, file.originalname);
        valuname = file.originalname;
        // console.log(valuname);
    }
});

var LogoUploads = multer({ storage: storages }).single('file');

/** API path that will upload the files */
app.post('/LogoUploads', function (req, res) {
    LogoUploads(req, res, function (err) {

        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        else {
            res.json(valuname);

        }

    });
});


// *** Enterprise config end ***



//  *** Change Password start  ***
const ChangePasswordConfig = require('./public/model/Schema/ChangePasswordSchema');
app.get('/Header/ChangePassword/:username', ChangePasswordConfig.postSignup);
app.post('/Headers/ChangeCheckPassword', ChangePasswordConfig.postcheckpwd);
app.put('/Header/ConfirmPassword/:confirmPwd/:username', ChangePasswordConfig.ConfirmPassowrdEntry);
// *** Change Password End ***


// *** Manage Role Start ***
app.get('/user/:username', userController.GetRoleid);
app.get('/role/:RoleID', ManageRoleConfig.PageView);
app.post('/AddNewRole', ManageRoleConfig.AddNewRole);
app.get('/Manage_RoleshowPopup/:id', ManageRoleConfig.ShowRoleDatapopup);
app.get('/Manage_Rolesshow', ManageRoleConfig.ShowRole);
app.put('/Roleupdate/', ManageRoleConfig.UpdateManageRole);
app.put('/ViewEditupdate/:id/:uiname/:view/:edit', ManageRoleConfig.RoleViewEditupdate);
app.put('/RoleNameUpdate/:id/:rolename', ManageRoleConfig.UpdateRoleName);

app.get('/GetActiveResourceType', ManageRoleConfig.GetActiveResourceType);
app.get('/GetInActiveResourceType', ManageRoleConfig.GetInActiveResourceType);

// *** Manage Role End ***


//** Manage User Start**


app.get('/GetUserEmailID/:getusermailid', userController.getusermailid);
app.get('/Manage_Usershow', userController.ShowUsers);
app.get('/Manage_Usershow1', userController.ShowUsers1);
app.get('/AdminMainsendDetails', userController.AdminMainsendDetails);
app.put('/ManageUserUpdate/:id/:ResourceID/:displayname/:email/:fname/:lname/:mobile/:role/:emailverified/:status/:isActive/:UpdatedById', userController.UpdateUser);
app.put('/ManageUserUpdate1/:id/:displayname/:email/:fname/:lname/:mobile/:emailverified/:status/:isActive/:UpdatedById', userController.UpdateUser1);
app.delete('/DeleteUser/:Userkeyid', userController.DeleteManageUser);
app.put('/GetUserName', userController.ShowUserID);
app.get('/GetRoleNameFromRoleUI', ManageRoleConfig.ShowRoleDropDown);
app.put('/IsRejectedByAdmin/:fname/:lname/:email', userController.SendMailForReject);
app.put('/IsApprovedByAdmin/:fname/:lname/:email', userController.SendMailForApprove);

app.post('/ProjectAllotNotification', userController.ProjectAllotNotification);
app.post('/TeamMemberAlotNotification', userController.TeamMemberAlotNotification);

//Registartion Admin Mail  Notfication Code
app.post('/ProjectAllotNotificationMailforAdmin', userController.ProjectAllotNotificationMailforAdmin);

// ** Manage User End **

// ** config Item Start **

app.post('/AddNewConfigureItem', ConfigureItems.AddNewConfigureItem);


app.put('/UpdateConfigureItem/', ConfigureItems.UpdateConfigureItem);


app.get('/ConfigureItems_Show/:FacilityService', ConfigureItems.ShowConfigureItems);

app.delete('/DeleteConfigureItem/:ConfigureItemId', ConfigureItems.DeleteConfigureItem);


// ** config Item End **

// *** Manage Facility Start ***
app.post('/AddNewFacility', ManageFacilityConfig.AddFacility);
app.get('/ViewFacility', ManageFacilityConfig.ShowFacility);
app.put('/ManageFacilityUpdates/:id/:FacilityName/:Address/:IsActive/:Region/:Area/:Postal_Code/:Contact_Person/:Contact_Email/:UpdatedById', ManageFacilityConfig.UpdateFacility);
app.get('/ViewUpdateFacilityDetails/:FacilityID', ManageFacilityConfig.ViewUpdateFacilityDetails);
app.put('/UpdateFacilityValues', ManageFacilityConfig.UpdateFacilityValues);
app.get('/GetFacilityNameFromFacilityUserMapping', ManageFacilityConfig.ShowFacilityName);
app.get('/GetDistinctFacilityID', ManageFacilityConfig.ShowFacilityID);
app.get('/Checkfacilitybyuser/:FacilityID/:username', Facility_UserMappingConfig.Checkfacilitybyuser);
//Country State City
app.get('/ViewCountryDetails', CountryConfig.showCountryDetails);
app.get('/ViewStateDetails/:CountryID', StateConfig.showStateDetails);
app.get('/ViewCityDetails/:StateID', CityConfig.showCityDetails);
app.get('/SelectStateDetails', StateConfig.selectStateDetails);
app.get('/SelectCityDetails', CityConfig.selectCityDetails);
// *** Manage Facility Start ***
app.get('/GetFacilityIDFromFacilityUserMapping/:LoggedinUsers', Facility_UserMappingConfig.GetFacilityIDFromFacilityUserMapping);
app.put('/UpdateFacilityUserMappingtable/:id/:facilityId/:userid/:Isactive', Facility_UserMappingConfig.UpdateFacility_UserMappingTable);
app.put('/UpdateFacilityUserMappingAssignedFalse/:id/:facilityId/:userid/:Isactive', Facility_UserMappingConfig.UpdateFacilityUserMappingAssignedFalse);
app.post('/SaveFacilityUserMappingtable/:facilityId/:userid/:Isactive', Facility_UserMappingConfig.SaveFacility_UserMappingTable);
app.get('/ViewUserAssignedToFacilitys/:FaclityId', Facility_UserMappingConfig.ViewUserMapping);
app.get('/ViewFacilityUser', Facility_UserMappingConfig.ViewFacilityUser);
app.post('/SaveUserIDInFacility_UserMapping/:CurrentUserId', Facility_UserMappingConfig.SaveUserIDAndIsActive);
app.put('/UpdateFacilityMapping/:CurrentUserId', Facility_UserMappingConfig.UpdateFacilityMapping);
app.put('/UpdateUserIDInFacilityMapping/:CurrentUserId', Facility_UserMappingConfig.UpdateUserIDInFacilityMapping);
app.get('/UserIDFromMappingtable', Facility_UserMappingConfig.getuseridvalue);
app.get('/GetUserMappingTableValues/:facilityidValue', Facility_UserMappingConfig.GetUserMappingTableValues);
// *** Manage Facility End ***



// ***Client Details Start ***

app.post('/AddClientDetails', ClientConfig.AddClientDetails);
app.get('/GetClientDetails/:FacilityService', ClientConfig.GetClientDetails);
app.delete('/DeleteClientDetails/:DeleteClientMasterKey', ClientConfig.DeleteClientDetails)
app.get('/GetUpdateClientDetails/:id/:FacilityService', ClientConfig.GetUpdateClientDetails);
app.put('/UpdateClientDetails', ClientConfig.UpdateClientDetails);

app.get('/GetClientName/:FacilityService', ClientConfig.GetClientNameforproject)
// *** Client Details End ***



// ManageprojectConfig Start
app.post('/AddProjectDetails', ManageprojectConfig.AddProjectDetails);
app.get('/GetProjectDetails/:FacilityService', ManageprojectConfig.GetProjectDetails);
app.get('/GetProjectDetails1/:FacilityService', ManageprojectConfig.GetProjectDetails1);
app.get('/GetUpdateProjectDetails/:id', ManageprojectConfig.GetUpdateProjectDetails);
app.put('/UpdataProjectDetailsData', ManageprojectConfig.UpdataProjectDetailsData);
app.put('/ProjectReactive', ManageprojectConfig.ProjectReactive)
app.put('/DeleteProjectReactive', ManageprojectConfig.DeleteProjectReactive)
app.get('/GetProjectEndDate/:ProjectID/:FacilityService', ManageprojectConfig.GetProjectEndDate);
app.get('/GetProjectDetailsINprogress/:FacilityService', ManageprojectConfig.GetProjectDetailsINprogress);
app.get('/GetProjectDetailsComplete/:FacilityService', ManageprojectConfig.GetProjectDetailsComplete);
app.get('/GetProjectDetailsDelete/:FacilityService', ManageprojectConfig.GetProjectDetailsDelete);
app.post('/InsertProjectMapping', ProjectMapping.InsertProjectMapping);
app.get('/CheckProjectMapping/:ProjectID/:FacilityService', ProjectMapping.CheckProjectMapping);
app.put('/UpdateProjectMapping', ProjectMapping.UpdateProjectMapping);


//for Manage team
app.get('/GetProjectDetailsforteam/:FacilityService', ManageprojectConfig.GetProjectDetailsforteam);
app.get('/Getteamleader/:ProjectID', ManageprojectConfig.Getteamleader);
//for Client Details
app.get('/GetCilentNamesDeleteCheck/:CID', ManageprojectConfig.GetCilentNamesDeleteCheck);


// ManageprojectConfig Start

app.get('/GetProjectNamesfortask/:FacilityService', ManageprojectConfig.GetProjectNamesfortask);


//ManageprojectConfig End





//*** Expenses ***
app.get('/ShowUsersforTeamDetails', userController.ShowUsersforTeamDetails);
app.get('/UserResource123/:FacilityService', Facility_UserMappingConfig.UserResource);
app.post('/AddExpense/:Month/:Year/:ExpenseID/:FacilityService', CostConfig.RemoveResourceCost, CostConfig.AddResourceCost);
app.get('/getExpense/:Month/:Year/:ExpenseID/:FacilityService', CostConfig.getCost);
app.post('/AddCommonCost/:Month/:Year/:FacilityService', CommonCostConfig.RemoveCommonCost, CommonCostConfig.AddCommonCost);
app.get('/getCommonCosts/:Month/:Year/:FacilityService', CommonCostConfig.getCommonCost);
app.post('/SaveNHR/:FacilityService', NHRConfig.AddNHR);
app.get('/getNHRResource/:FacilityService', NHRConfig.getNHRResource);
app.get('/getTotalExpense/:Month/:Year/:ExpenseID/:FacilityService', CostConfig.getTotalExpense);
app.get('/getTotalBillableExpense/:Month/:Year/:FacilityService', CostConfig.getTotalBillableExpense);

app.get('/GettotalExpenseValues/:Month/:Year/:FacilityService', CostConfig.GettotalExpenseValues);
// app.get('/getAllExpenseTypeCost/:FacilityService', NHRConfig.getNHRResource);

//Manage Team

app.post('/AddTeam', ManageTeamConfig.AddTeam);
app.get('/GetManageTeamDetails/:FacilityService', ManageTeamConfig.GetManageTeamDetails);
app.get('/Getteamdetails/:FacilityService', ManageTeamConfig.Getteamdetails);
app.post('/AddTeamMembers', ManageTeamConfig.AddTeamMembers);
app.get('/Getresourceview/:FacilityService', ManageTeamConfig.Getresourceview);
app.get('/GetresourceviewDuplicate/:ProjectId/:data', ManageTeamConfig.GetresourceviewDuplicate);
app.post('/DeleteProjectTeamMembers', ManageTeamConfig.RemoveTeamMembersDetails);
app.post('/DeleteProjectTeamMembersRowKey', ManageTeamConfig.DeleteTeamDetails);
app.get('/GetResourcesBasedProject/:ProjectID', ManageTeamConfig.GetResourcesBasedProject);
app.get('/GetResourcesBasedProject1/:ProjectName', ManageTeamConfig.GetResourcesBasedProject1);
app.post('/UpdateResourcesBasedProject/:ProjectID', ManageTeamConfig.RemoveResourcesBasedProject, ManageTeamConfig.UpdateResourcesBasedProject);
app.put('/UpdateBillingRateValues', ManageTeamConfig.UpdateBillingRateValues)
app.get('/GetResourcesBasedProjectDeleteCheck/:ProjectID', ManageTeamConfig.GetResourcesBasedProjectDeleteCheck)
app.put('/projectteamsUpdate', ManageTeamConfig.projectteamsUpdate)
app.put('/projectteamsDetailsUpdate', ManageTeamConfig.projectteamsDetailsUpdate)
app.get('/GetteamMemberdetails/:FacilityService', ManageTeamConfig.GetteamMemberdetails)
// ManageTeamConfig Start
app.get('/GetteamMemberDetailsForTask/:ProjectID', ManageTeamConfig.GetteamMemberDetailsForTask)











//Manage Task
app.get('/GetTaskBasedFacilityDetails/:FacilityService', ManageTaskConfig.GetTaskBasedFacilityDetails)
app.post('/AddTaskBasedFacility', ManageTaskConfig.AddTask);
app.put('/UpdateManageTaskDetails', ManageTaskConfig.UpdateManageTaskDetailsUpsert)
app.get('/GetTaskGridValues1/:UserName/:GridProjectID/:FacilityService', ManageTaskConfig.GetTaskGridValues1)
app.get('/GetTaskGridValues/:GridProjectID/:FacilityService', ManageTaskConfig.GetTaskGridValues)
app.get('/GetTaskTotHours/:username/:FacilityService', ManageTaskConfig.GetTaskGridValues11)
app.get('/GetProjNameByUser/:username/:FacilityService', ManageTaskConfig.GetProjName)
app.get('/GetResourceSalary/:FacilityService', CostConfig.GetResourceSalary);
app.put('/updatetaskphase/:TaskId/:ActualEndDate', ManageTaskConfig.updatetaskphase);
app.get('/GetResourceLoadedCostFromExpense/:FacilityService', CostConfig.GetResourceLoadedCostFromExpense);



//TimeSheet

app.get('/GetPMSUserTimeSheet', TimeSheetConfig.GetPMSUserTimeSheet);

app.post('/SaveActivity', TimeSheetConfig.AddTimeSheet);
app.post('/InsertTimeSheet', TimeSheetConfig.AddTimeSheet);
app.post('/InsertTimeSheet1', TeamLeadTimeSheetConfig.AddTimeSheet);
app.get('/GetTimeSheet/:username/:FacilityService/:ProjectID', TimeSheetConfig.GetTimeSheet);
app.get('/GetTimeSheetforProj/:username/:FacilityService', TimeSheetConfig.GetTimeSheetforProj);
app.get('/GetUserTimeSheet/:username/:FacilityService', TimeSheetConfig.GetTimeSheet1);
app.get('/GetEvent/:GetTimeSheeetID', TimeSheetConfig.GetEvent);
app.put('/UpdataEvent', TimeSheetConfig.UpdataEvent);
app.put('/UpdataEvent1', TeamLeadTimeSheetConfig.UpdataEvent);
app.put('/UpdatePublish', TimeSheetConfig.UpdateTimeSheet);
app.put('/UpdateResize', TimeSheetConfig.UpdateResize);
app.get('/Getpublished/:id', TimeSheetConfig.Getpublished)
app.get('/Getpublished1/:StartDate', TimeSheetConfig.Getpublished1);
// app.get('/GetTimeSheeetID/:GetEventID',ManageTaskConfig.GetTimeSheeetID);
app.get('/GetTaskEvent/:GetEventID', ManageTaskConfig.GetTaskEvent);
app.get('/GetEvent1/:Text/:Date/:UserName/:TimeSheetID', TeamLeadTimeSheetConfig.GetEvent1);
app.put('/UpdateResize1', TeamLeadTimeSheetConfig.UpdateResize);
app.get('/getTaskDetails/:GetEventID/:username/:ProjectID', ManageTaskConfig.getTaskDetails); //added
app.get('/GetTimeSheetSelectedDate/:username/:FacilityService/:ProjectID/:Date/:TaskID', TimeSheetConfig.GetTimeSheetSelectedDate);//added
app.get('/GetAllTaskEvent/:ProjectID/:username/:FacilityService', ManageTaskConfig.GetAllTaskEvent);

//Team Lead Timesheet

app.get('/ViewManageTasks/:FacilityService', ManageTaskConfig.GetManageTaskConfig);
app.get('/GetTeamLeadTimeSheet/:Date/:id/:FacilityService/:UserName', TeamLeadTimeSheetConfig.GetTeamLeadTimeSheet);
app.get('/GetTeamLeadTimeSheet1/:Date/:UserName/:FacilityService/:ProjectNameID', TeamLeadTimeSheetConfig.ChkTeamLeadTimeSheet);
app.get('/GetTeamLeadTimeSheetEdit/:GetID/:FacilityService', TeamLeadTimeSheetConfig.GetTeamLeadTimeSheet1);
app.put('/updateTeamLeadTimeSheet', TeamLeadTimeSheetConfig.updateTeamLeadTimeSheet);
app.put('/UpdateTeamLeadTimeSheetPublish', TeamLeadTimeSheetConfig.UpdateTeamLeadTimeSheetPublish);
app.get('/GetTeamLeadTimeSheetFull/:GetUserName/:FacilityService', TeamLeadTimeSheetConfig.GetTeamLeadTimeSheetFull);
app.get('/GetTeamLeadTimeSheetFullAdd/:GetUserName/:FacilityService/:Date1', TeamLeadTimeSheetConfig.GetTeamLeadTimeSheetFullAdd);
app.get('/GetActualHoursFromTeamLeadTimesheet/:GridProjectID/:FacilityService', TeamLeadTimeSheetConfig.GetActualHoursFromTeamLeadTimesheet)
app.get('/GetProj/:FacilityService', ManageprojectConfig.GetProjectNamesfortask);
app.get('/GetProjUserName/:FacilityService/:ProjectID', ManageTaskConfig.GetProjUserName);
app.get('/GetTeamLeadProjectProj/:username', ManageprojectConfig.GetTeamLeadProjectProj);

//TimeSheet Report
app.get('/TimeSheetReport/:UserName/:FacilityService/:ProjectNameID', TeamLeadTimeSheetConfig.TimeSheetReport);
app.get('/TimeSheetPublishedReport/:UserName/:FacilityService/:ProjectNameID', TimeSheetConfig.TimeSheetPublishedReport);
app.get('/TeamLeadTimeSheetPublishedReport/:UserName/:FacilityService/:ProjectNameID', TeamLeadTimeSheetConfig.TimeSheetPublishedReport);

//Billable Report
app.get('/GetBillableTimeSheet', TimeSheetConfig.GetBillableTimeSheet);
app.get('/GetBillableTeamLeadTimeSheet', TeamLeadTimeSheetConfig.GetBillableTeamLeadTimeSheet);
app.get('/BillableUser', userController.BillableUser);
app.get('/GetProjectDetailsReport', function (req, res) {
    debugger
    marginReportTemplate();
});
//margin report template

app.get('/GetMarginReportData', MarginReportTemplate.GetMarginReportData);
app.get('/GetTaskBasedProjDetails1/:Id', ManageTaskConfig.GetTaskBasedProjDetails1);
app.get('/getAllCost',CostConfig.getAllCost);
app.get('/GetTeamLeadTSDetails1/:Id', TeamLeadTimeSheetConfig.GetTeamLeadTSDetails1);
app.get('/GetProjectTeamMembers1/:Id', ManageTeamConfig.GetProjectTeamMembers1);

var Excel = require('exceljs');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('MaterialFlowSheet');
var fs = require('fs');
var http = require('http');
const tempfile = require('tempfile');


app.post('/GetexcelSheet/:ExcelPhaseC/:ExcelTypeC/:ExcelIsBIllableC/:ExcelIsCRC/:ConfigurableItemC/:FacilityService/:ExcelProjectNameC/:ExcelUserNameC', function (req, res) {

    var ExcelPhase = req.params.ExcelPhaseC;
    var ExcelProjectName = req.params.ExcelProjectNameC;
    var ExcelUserName = req.params.ExcelUserNameC;
    var ExcelType = req.params.ExcelTypeC;
    var ConfigurableItem = req.params.ConfigurableItemC;
    var ExcelIsBIllable = req.params.ExcelIsBIllableC;

    var ExcelIsCR = req.params.ExcelIsCRC;
    var workbook = new Excel.Workbook();
    var FacilityID = req.params.FacilityService;

    var worksheet = workbook.addWorksheet('TaskSheet');
    var InstructionSheet = workbook.addWorksheet('Instruction');
    var imageId = workbook.addImage({
        filename: './public/assets/Images/Picture1.png',
        extension: 'png',
    });
    // Set a specific row height 
    InstructionSheet.addImage(imageId, 'A2:O2');
    var row = InstructionSheet.getRow(2);
    row.height = 35;
    var row3 = InstructionSheet.getRow(2);
    InstructionSheet.mergeCells('A4:B4');
    InstructionSheet.mergeCells('A5:H5');
    InstructionSheet.mergeCells('A7:B7');
    InstructionSheet.mergeCells('A8:G8');
    InstructionSheet.mergeCells('A9:O9');
    InstructionSheet.mergeCells('A12:I12');
    InstructionSheet.mergeCells('A13:G13');
    InstructionSheet.mergeCells('A16:H16');
    InstructionSheet.mergeCells('A17:H17');
    InstructionSheet.mergeCells('A20:L20');
    InstructionSheet.mergeCells('A23:E23');
    InstructionSheet.mergeCells('A24:J24');
    InstructionSheet.mergeCells('A25:G25');
    InstructionSheet.mergeCells('A28:E28');
    InstructionSheet.mergeCells('A29:J29');
    InstructionSheet.mergeCells('A30:G30');
    InstructionSheet.mergeCells('A33:G33');
    InstructionSheet.mergeCells('A36:H36');
    InstructionSheet.getCell('B4').value = 'A: Project Name';
    InstructionSheet.getCell('H5').value = req.body.ProjectNameInfo;
    InstructionSheet.getCell('N4').value = 'Task Info';
    InstructionSheet.getCell('N5').value = '- TeamLead Should not enter the task more than a week';
    InstructionSheet.getCell('N6').value = '- TeamLead Should Calculate the Hours based on the Task';
    InstructionSheet.getCell('B7').value = 'B: UniqueID';
    InstructionSheet.getCell('G8').value = req.body.UniqueIDInfo.split("/%*")[0];
    InstructionSheet.getCell('O9').value = req.body.UniqueIDInfo.split("/%*")[1];
    InstructionSheet.getCell('A11').value = 'C: Name';
    InstructionSheet.getCell('G12').value = req.body.NameInfo.split("/%*")[0];
    InstructionSheet.getCell('G13').value = req.body.NameInfo.split("/%*")[1];
    InstructionSheet.getCell('A15').value = 'D: Resource Names';
    InstructionSheet.getCell('H16').value = req.body.ResourceNamesInfo.split("/%*")[0];
    InstructionSheet.getCell('H17').value = req.body.ResourceNamesInfo.split("/%*")[1];
    InstructionSheet.getCell('A19').value = 'E: Duration';
    InstructionSheet.getCell('L20').value = req.body.DurationInfo;
    InstructionSheet.getCell('A22').value = 'F: Start Date';
    InstructionSheet.getCell('E23').value = req.body.StartInfo.split("/%*")[0];
    InstructionSheet.getCell('J24').value = req.body.StartInfo.split("/%*")[1];
    InstructionSheet.getCell('G25').value = req.body.StartInfo.split("/%*")[2];
    InstructionSheet.getCell('A27').value = 'F: End Date';
    InstructionSheet.getCell('E28').value = req.body.FinishInfo.split("/%*")[0];
    InstructionSheet.getCell('J29').value = req.body.FinishInfo.split("/%*")[1];
    InstructionSheet.getCell('G30').value = req.body.FinishInfo.split("/%*")[2];
    InstructionSheet.getCell('A32').value = 'H: Predecessors';
    InstructionSheet.getCell('G33').value = req.body.PredecessorsInfo;
    InstructionSheet.getCell('A35').value = 'I: Phase';
    InstructionSheet.getCell('A36').value = req.body.PhaseInfo;





    InstructionSheet.getCell('A4').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('N4').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('N5').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('N6').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A7').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A11').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A15').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A19').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A22').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A27').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A31').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A32').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A34').font = {
        name: 'Calibri',
        bold: true
    };
    InstructionSheet.getCell('A35').font = {
        name: 'Calibri',
        bold: true
    };



    worksheet.columns = [

        { header: 'ProjectName', key: 'id', width: 40 },
        { header: 'UniqueID', key: 'name', width: 10 },
        { header: 'Name', key: 'name', width: 40 },
        { header: 'Resource', key: 'name', width: 32 },
        { header: 'Type', key: 'name', width: 32 },
       // { header: 'ConfigurableItem', key: 'string', width: 25 },
        { header: 'IsBillable', key: 'name', width: 12 },
        { header: 'IsCR', key: 'name', width: 12 },
        { header: 'Effort', key: 'name', width: 25 },
        { header: 'StartDate', key: 'string', width: 25, style: { numFmt: 'mm-dd-yyyy' } },
        { header: 'EndDate', key: 'string', width: 25, style: { numFmt: 'mm-dd-yyyy' } },
        { header: 'Predecessors', key: 'string', width: 25, style: { numFmt: 0 } },
        { header: 'Phase', key: 'string', width: 25 },

        //   { header: 'FacilityID', key: 'string', width: 25 },

    ];
    worksheet.getCell('A1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('B1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('C1').font = {
        name: 'Calibri',

        bold: true
    };

    worksheet.getCell('D1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('E1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('F1').font = {
        name: 'Calibri',

        bold: true
    };
    var F1 = worksheet.getColumn('F');
    F1.hidden = true;
    worksheet.getCell('G1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('H1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('I1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('J1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('K1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('L1').font = {
        name: 'Calibri',

        bold: true
    };
    worksheet.getCell('M1').font = {
        name: 'Calibri',

        bold: true
    };



    //User Name Dropdown 
    var UserValue = ExcelUserName.split(',');
    for (i = 0; i < UserValue.length; i++) {
        InstructionSheet.getCell('U' + (i + 2)).value = UserValue[i];
    }
    var UserlistValueColumn = InstructionSheet.getColumn('U');
    UserlistValueColumn.hidden = true;

    //  //Phase dropdown bind
    var PhaseValue = ExcelPhase.split(',');
    for (i = 0; i < PhaseValue.length; i++) {
        InstructionSheet.getCell('V' + (i + 2)).value = PhaseValue[i];
    }
    var PhaselistValueColumn = InstructionSheet.getColumn('V');
    PhaselistValueColumn.hidden = true;

    //Project Name Dropdown 
    var ProjValue = ExcelProjectName.split(',');
    for (i = 0; i < ProjValue.length; i++) {
        InstructionSheet.getCell('W' + (i + 2)).value = ProjValue[i];
    }
    var ProjlistValueColumn = InstructionSheet.getColumn('W');
    ProjlistValueColumn.hidden = true;
    for (i = 2; i < 1000; i++) {
        worksheet.getCell('A' + i).dataValidation = {
            type: 'list',
            allowBlank: true,

            formulae: ['=Instruction!$W$2:$W$' + (ProjValue.length + 1)]

        };


        worksheet.getCell('D' + i).dataValidation = {
            type: 'list',
            allowBlank: true,

            formulae: ['=Instruction!$U$2:$U$' + (UserValue.length + 1)]

        };
        worksheet.getCell('E' + i).dataValidation = {
            type: 'list',
            allowBlank: true,

            formulae: [ExcelType]

        };
        worksheet.getCell('F' + i).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [ConfigurableItem]
            //  formulae: [ExcelIsBIllable]

        };
        worksheet.getCell('G' + i).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [ExcelIsBIllable]
            //formulae: [ExcelIsCR]

        };

        worksheet.getCell('H' + i).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [ExcelIsCR]
            // formulae: [ExcelPhase]

        };


        worksheet.getCell('M' + i).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['=Instruction!$V$2:$V$' + (PhaseValue.length + 1)]



        };
        worksheet.getCell('B' + i).dataValidation = {
            type: 'date',
            allowBlank: true,

        };


    }
    worksheet.getCell('U1').value = 'FacilityID';
    worksheet.getCell('U2').value = FacilityID;
    var listValueColumn = worksheet.getColumn('U');
    listValueColumn.hidden = true;


    var fileName = "Task" + '_Template.xlsx';
    var tempFilePath = __dirname + "\\public\\template\\" + fileName;
    workbook.xlsx.writeFile(tempFilePath).then(function () {
        res.send(fileName);
    });

});








var Service = require('node-windows').Service;

// Create a new service object
// var svc = new Service({
    // name: 'PMS',
    // description: 'BESTIR Software Service',
    // //script: 'D:\\Mean Stack\\PMS\\server.js'
    // script: 'D:\\PMS\\August2018\\22.08.2018\\PMS\\server.js'
// });



// // Listen for the 'install' event, which indicates the
// // process is available as a service.
// svc.on('install', function () {
    // svc.start();
// });

// // install the service
// svc.install();




//margin Report Template

//Scheduler
var mongo = require('mongodb');


var marginReportTemplate = async(function () {



    var Projects =
        await(ManageprojectConfig.GetAllProjectDetails());
    var current = new Date();     // get current date    
    var weekstart = current.getDate() - current.getDay() + 1;
    var weekend = weekstart + 6;       // end day is the first day + 6 

    var monday = new Date(current.setDate(weekstart));
    var sunday = new Date(current.setDate(weekend));


    var MarginReport = [];
    var startDate = (monday); //YYYY-MM-DD
    var endDate = (sunday); //YYYY-MM-DD
    //get between dates
    var getDateArray = function (start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            arr.push(new Date(dt));
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    var dateArr = getDateArray(startDate, endDate);


    function getFormattedDate(date) {

        var year = date.getFullYear();

        var month = (1 + date.getMonth()).toString();

        month = month.length > 1 ? month : '0' + month;

        var day = date.getDate().toString();

        day = day.length > 1 ? day : '0' + day;

        return day + '-' + month + '-' + year;

    }

    var Dates = [];

    for (i = 0; i < 7; i++) {
        Dates.push(getFormattedDate(dateArr[i]));
    }


    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    for (var i = 0; i < Projects.length; i++) {
        var ID = Projects[i]._doc._id;

        ID = new mongo.ObjectID(ID);

        var TaskDetails = await(ManageTaskConfig.GetTaskBasedProjDetails(ID));
        var TeamLeadTSDetails = await(TeamLeadTimeSheetConfig.GetTeamLeadTSDetails(ID));
        var ProjectTeamMembers = await(ManageTeamConfig.GetProjectTeamMembers(ID));

        //  var GetLoadedCostCalc = 


        if (TaskDetails.length > 0) {
            var Hours = 0;
            var PlannedCost = 0;
            var actCost=0;
            for (j = 0; j < TaskDetails.length; j++) {
                MarginReport = [];
                for (k = 0; k < 7; k++) {
                    Dates[k];

                    var dateFrom = TaskDetails[j]._doc.PlanStartDate;
                    var dateTo = TaskDetails[j]._doc.PlanEndDate;




                    var dateCheck = Dates[k];

                    var d1 = dateFrom.split("-");
                    var d2 = dateTo.split("-");

                    var c = dateCheck.split("-");

                    var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
                    var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);

                    var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);


                    if (check >= from && check <= to) {
                        MonthName = monthNames[check.getMonth()];

                        UserName = TaskDetails[j]._doc.TeamMemberUserID;
                        HRBillable = await(CostConfig.GetLoadedCostCalc('HRB', MonthName, UserName, c[2]));
                        HRNONBillable = await(CostConfig.GetLoadedCostCalc('HRNB', MonthName, UserName, c[2]));
                        NonHR = await(CostConfig.GetLoadedCostCalc('NHR', MonthName, UserName, c[2]));
                        HRBillableForMonth = await(CostConfig.GetLoadedCostCalcMonth('HRB', MonthName, parseInt(c[2])));

                        HRNONBillableForMonth = await(CostConfig.GetLoadedCostCalcMonth('HRNB', MonthName, parseInt(c[2])));

                        NonHRForMonth = await(CostConfig.GetLoadedCostCalcMonth('NHR', MonthName, parseInt(c[2])));
                       // console.log(HRBillable)
                        if(HRBillable.length==0){
                            Amount =0;
                        }
                        else{
                            Amount = HRBillable[0]._doc.Amount;
                        }
                      
                       // console.log(Amount)
                        if (HRBillableForMonth.length == 0) {
                            HRBillableCost = 0;
                        }
                        else {
                            HRBillableCost = HRBillableForMonth[0].sum;

                        }

                        if (HRNONBillableForMonth.length == 0) {
                            HRNONBillableCost = 0;
                        }
                        else {
                            HRNONBillableCost = HRNONBillableForMonth[0].sum;

                        }

                        if (NonHRForMonth.length == 0) {
                            NonHRCost = 0;

                        }
                        else {
                            NonHRCost = NonHRForMonth[0].sum;

                        }
                        if (HRBillableForMonth.length == 0 && HRNONBillableForMonth.length == 0 && NonHRForMonth.length == 0) {
                            loadedCost = 0;
                        }
                        else {
                            
                            total = HRBillableCost + HRNONBillableCost + NonHRCost;
                            loadedCost = total / HRBillableCost;
                            
                        }
                       



                      



                        PerHourCost = (Amount * loadedCost / 160);

                        var From = new Date(d1[2] + '-' + (d1[1]) + '-' + d1[0]);
                        var To = new Date(d2[2] + '-' + (d2[1]) + '-' + d2[0]);
                        var BetweenDates = getDateArray((From), (To));
                        oneDayHour = TaskDetails[j]._doc.Duration / BetweenDates.length;
                       
                        Hours += TaskDetails[j]._doc.Duration / BetweenDates.length;
                        PlannedCost += (oneDayHour * PerHourCost);

                    }



                }
                var GetWeekcount = await(MarginReportTemplate.GetWeekNo());
                GetWeekcount = GetWeekcount.filter(function (sl) {
                    return sl.ProjectName == Projects[i]._doc.ProjectName
                })
                if (GetWeekcount.length > 0) {
                   
                    var week = GetWeekcount[GetWeekcount.length-1]._doc;
                  
                    w = week.week;

                    w = w.split("Week");
                    
                    week = "Week" + (parseInt(w[1]) + 1);
                    if (week == undefined) {

                    }
                }
                else {
                    week = 'Week1'
                }




            }
            actHours = 0;
            for (j = 0; j < TeamLeadTSDetails.length; j++) {
                MarginReport = [];
                for (k = 0; k < 6; k++) {
                    Dates[k];



                    var actdateFrom = TeamLeadTSDetails[j]._doc.StartDate;
                    var actdateTo = TeamLeadTSDetails[j]._doc.EndDate;

                    var dateCheck = Dates[k];


                    var actd1 = actdateFrom.split("-");
                    var actd2 = actdateTo.split("-");
                    var c = dateCheck.split("-");


                    var actfrom = new Date(actd1[2], parseInt(actd1[1]) - 1, actd1[0]);  // -1 because months are from 0 to 11
                    var actto = new Date(actd2[0], parseInt(actd2[1]) - 1, actd2[2]);
                    var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);



                    if (dateCheck == actdateFrom) {
                        MonthName = monthNames[check.getMonth()];

                       UserName=TeamLeadTSDetails[j]._doc.UserName;
                        HRBillable = await(CostConfig.GetLoadedCostCalc('HRB', MonthName, UserName, c[2]));
                        HRNONBillable = await(CostConfig.GetLoadedCostCalc('HRNB', MonthName, UserName, c[2]));
                        NonHR = await(CostConfig.GetLoadedCostCalc('NHR', MonthName, UserName, c[2]));
                        HRBillableForMonth = await(CostConfig.GetLoadedCostCalcMonth('HRB', MonthName, parseInt(c[2])));

                        HRNONBillableForMonth = await(CostConfig.GetLoadedCostCalcMonth('HRNB', MonthName, parseInt(c[2])));

                        NonHRForMonth = await(CostConfig.GetLoadedCostCalcMonth('NHR', MonthName, parseInt(c[2])));
                        console.log(HRBillable)
                        Amount = HRBillable[0]._doc.Amount;
                        console.log(Amount)
                        if (HRBillableForMonth.length == 0) {
                            HRBillableCost = 0;
                        }
                        else {
                            HRBillableCost = HRBillableForMonth[0].sum;

                        }

                        if (HRNONBillableForMonth.length == 0) {
                            HRNONBillableCost = 0;
                        }
                        else {
                            HRNONBillableCost = HRNONBillableForMonth[0].sum;

                        }

                        if (NonHRForMonth.length == 0) {
                            NonHRCost = 0;

                        }
                        else {
                            NonHRCost = NonHRForMonth[0].sum;

                        }
                        if (HRBillableForMonth.length == 0 && HRNONBillableForMonth.length == 0 && NonHRForMonth.length == 0) {
                            loadedCost = 0;
                        }
                        else {
                            
                            total = HRBillableCost + HRNONBillableCost + NonHRCost;
                            loadedCost = total / HRBillableCost;
                            
                        }
                       



                      



                        PerHourCost = (Amount * loadedCost / 160);

                        var From = new Date(d1[2] + '-' + (d1[1]) + '-' + d1[0]);
                        var To = new Date(d2[2] + '-' + (d2[1]) + '-' + d2[0]);
                        var BetweenDates = getDateArray((From), (To));
                        oneDayHour = TeamLeadTSDetails[j]._doc.Hours;
                        console.log(oneDayHour + ',' + PerHourCost + '.' + BetweenDates.length)
                       
                        actCost += (oneDayHour * PerHourCost);
                        actHours += TeamLeadTSDetails[j]._doc.Hours;

                    }

                }
                var GetWeekcount = await(MarginReportTemplate.GetWeekNo());
                GetWeekcount = GetWeekcount.filter(function (sl) {
                    return sl.ProjectName == Projects[i]._doc.ProjectName
                })
                // if (GetWeekcount.length > 0) {
                //     var week = GetWeekcount[0]._doc;
                //     w = week.week;
                //     console.log(w)
                //     w = w.split("Week")
                //     console.log(w)
                //     console.log(w[1])
                //     week = "Week" + (parseInt(w[1]) + 1);
                //     if (week == undefined) {

                //     }
                // }
                // else {
                //     week = 'Week1'
                // }




            }
            if (Hours > 0) {
                var obj = {};
                obj.week = week;
                obj.ProjectName = Projects[i]._doc.ProjectName;
                obj.StartDate = Dates[0];
                obj.EndDate = Dates[6];

                obj.PlannedEfforts = Hours;
                obj.PlannedRevenue = PlannedCost;
                obj.ActualEfforts = actHours;
                obj.ActualRevenue = actCost;
                MarginReport.push(obj);
            }
            if (MarginReport.length > 0) {
                for (a = 0; a < MarginReport.length; a++) {


                    await(MarginReportTemplate.AddReport(MarginReport[a]));
                }
            }


        }


    }


});

//End








app.set('port', process.env.App_PORT || 3000);
app.listen(app.get('port'), () => {
    console.log('%s server running on port', chalk.green('✓'), app.get('port'));
    console.log('  Press CTRL-C to stop\n');
   // marginReportTemplate();
});


