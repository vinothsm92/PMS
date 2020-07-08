
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var FacilityService = '';
var DeleteMasterKey = '';
var tabname = '';

app.run(function (editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.directive('myModal', function () {
    return {
        restrict: 'A',
        scope: { myModalIsOpen: '=' },
        link: function (scope, element, attr) {
            scope.$watch(
                function () { return scope.myModalIsOpen; },
                function () { element.modal(scope.myModalIsOpen ? 'show' : 'hide'); }
            );
        }
    }
});

app.directive('capitalize', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.toUpperCase();
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]); // capitalize initial value
        }
    };
});


app.controller('ProjectDetails', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {



        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {

            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[6].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }
        refreshsUpdate();
        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {
            if (newVal !== '') {
                FacilityService = newVal;
                $http.get('/GetClientName/' + FacilityService).then(function (response) {
                    $scope.GetClientNames = response.data;
                    if ($scope.GetClientNames.length == 0) { $notify.warning('warning', "No Client Names to Display"); }
                    $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
                        $scope.GetProjectDetails = response.data;
                        for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                            $scope.GetProjectDetails[i].ActiveStatus = "Active";
                        }

                    });
                });
            }
            refresh();
        });
        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;
        var username = $cookieStore.get('LoggedinUser');

        // GetUsername from Users

        $http.get('/UserResource123/' + FacilityService).then(function (response) {

            $scope.GetUserNames = response.data;

        });


        //filter client name
        $scope.ClientNameFilter = function (data) {
            

            $scope.FClinetName = data;
        };
        $scope.RoleNameFilter = function (data) {
            
            $scope.FRoleName = data;
        };
        $scope.checkDate = function () {

            var StartDateCheck = $scope.ManageProject.StartDate;
            var EndDateCheck = $scope.ManageProject.EndDate;

        }
        $scope.customClientNameFilter = function (GetProjectDetail) {

            if ($scope.FClinetName == undefined) { return true }
            else {
                var mstream = $scope.showProjectClientNameFilter(GetProjectDetail.ClientName);
                return (mstream.toLowerCase().indexOf($scope.FClinetName.toLowerCase()) !== -1);
            }
        };
        $scope.customRoleNameFilter = function (ProjectMapping) {
            
            if ($scope.FRoleName == undefined) { return true }
            else {
                var mstream = $scope.showRoleName(ProjectMapping);
                return (mstream.toLowerCase().indexOf($scope.FRoleName.toLowerCase()) !== -1);
            }
        };

        $scope.showProjectRoleNameFilter = function (Roleid) {
            
            if ($scope.Manage_Roleser.length > 0) {
                var SelectStream1 = [];
                if (Roleid) {
                    SelectStream1 = $filter('filter')($scope.Manage_Roleser, { _id: Roleid });
                }
                return SelectStream1[0].Role;
            }
            else {
            }
        };

        $scope.showProjectClientNameFilter = function (clientid) {
            if ($scope.GetClientNames.length > 0) {
                var SelectStream1 = [];
                if (clientid) {
                    SelectStream1 = $filter('filter')($scope.GetClientNames, { _id: clientid });
                }
                return SelectStream1[0].ClientName;
            }
            else {
            }
        };

        //Add Project Details
        $scope.AddProjectDetails = function () {

            try {
                if ($scope.ManageProject.StartDate == "" || $scope.ManageProject.StartDate == undefined || $scope.ManageProject.EndDate == "" || $scope.ManageProject.EndDate == undefined) {

                    alert("select Date")
                    return;
                }
                $scope.ManageProject.UpdatedById = "null";
                if ($scope.ManageProject.ProjectDetails == undefined || $scope.ManageProject.ProjectDetails == null || $scope.ManageProject.ProjectDetails == "") {
                    $scope.ManageProject.ProjectDetails = "";
                }
                var e = document.getElementById("PBillingType");
                var BillingTypeValue = parseInt(e.options[e.selectedIndex].value);
                if (BillingTypeValue != 1 || BillingTypeValue != "1") {
                    $scope.ManageProject.EffortsinDays = 0;
                    $scope.ManageProject.Revenue = 0;
                }
                var a = document.getElementById("PTeamLeader");
                var TeamLeaderID = a.options[a.selectedIndex].value;

                var b = document.getElementById("ProjectStatus");
                var ProjectStatus = parseInt(b.options[b.selectedIndex].value);

                var c = document.getElementById("ProjectClientName");
                var ProjectClient = c.options[c.selectedIndex].value;
                var ProjectName = $scope.ManageProject.ProjectName;

                $http.post('/AddProjectDetails', {
                    'ProjectName': $scope.ManageProject.ProjectName,
                    'TeamLeaderUserID': TeamLeaderID,
                    'StartDate': $scope.ManageProject.StartDate,
                    'EndDate': $scope.ManageProject.EndDate,
                    'BillingType': BillingTypeValue,
                    'EffortInDays': $scope.ManageProject.EffortsinDays,
                    'RevenueInDoller': $scope.ManageProject.Revenue,
                    'Description': $scope.ManageProject.ProjectDetails,
                    'ProjectStatus': ProjectStatus,
                    'ClientName': ProjectClient,
                    'CreatedById': username,
                    'UpdatedById': $scope.ManageProject.UpdatedById,
                    'FacilityID': FacilityService,
                    'IsActive': true
                }).then(function (response) {
                    refresh();
                    $notify.success('Success', "Project Details Stored successfully and e-mail is sent to the Team Lead");
                    $scope.ManageProject = "";
                    $scope.PBillingType = "";
                    $scope.PTeamLeaderID = "";
                    $scope.PGetClientName = "";

                    //Mail Code
                    if ($scope.GetUserNames.length > 0) {
                        var SelectStream = [];
                        SelectStream = $filter('filter')($scope.GetUserNames, { UserName: TeamLeaderID });
                        var email = SelectStream[0].Email;
                        $http.get('/GetUserEmailID/' + TeamLeaderID).then(function (response) {
                            $scope.GetUserEmail = response.data;
                            var sendemail = $scope.GetUserEmail[0].Email;
                            $http.post('/ProjectAllotNotification', {
                                "TeamLeaderID": TeamLeaderID,
                                "ProjectNameInfo": ProjectName,
                                "email": sendemail
                            }).then(function (response) {

                            });
                        });
                    }



                });
            } catch (error) {
                $notify.warning('warning', error);
            }
        }



        //edit function
        var EditMasterRowKey = '';
        $scope.EditProjectClick = function (id, ProjName) {
            ;
            EditMasterRowKey = id;
            $scope.ProjId = id;
            $scope.PopupProjectname = ProjName;
            $scope.GetUpdateProjectDetails = '';



            $http.get('/GetClientName/' + FacilityService).then(function (response) {
                $scope.GetClientNames = response.data;

                $http.get('/GetUpdateProjectDetails/' + id).then(function (response) {
                    $scope.GetUpdateProjectDetails = response.data;
                    $scope.GetUpdateProjectDetails[0].StartDate = $filter('date')($scope.GetUpdateProjectDetails[0].StartDate, 'dd-MM-y');

                    $scope.GetUpdateProjectDetails[0].EndDate = $filter('date')($scope.GetUpdateProjectDetails[0].EndDate, 'dd-MM-y');

                });
            });


        }
        //Project Details popup code
        $scope.Projectpopupclick = function (id, ProjName) {
            ;
            $http.get('/GetUpdateProjectDetails/' + id).then(function (response) {
                $scope.ProjectDetailsPopup = response.data;

                //Show client name in project details popup
                $scope.showProjectClientName = function (clientid) {
                    if ($scope.GetClientNames.length > 0) {
                        var SelectStream1 = [];
                        if (clientid) {

                            SelectStream1 = $filter('filter')($scope.GetClientNames, { _id: clientid });
                        }
                        return SelectStream1.length ? SelectStream1[0].ClientName : 'Select';
                    }
                    else {

                    }

                };

                //show project progress Name
                $scope.showProjectStatus = function (ProjectStatus) {
                    if ($scope.ProjectStatus.length > 0) {
                        var SelectStream1 = [];
                        if (ProjectStatus) {

                            SelectStream1 = $filter('filter')($scope.ProjectStatus, { ProjectStatusID: ProjectStatus });
                        }
                        return SelectStream1.length ? SelectStream1[0].ProjectStatus : 'Select';
                    }
                    else {
                        $notify.warning('warning', "Check Project Status in Json File");
                    }

                };
                //show billing type
                $scope.showbillingtype = function (billtype) {
                    if ($scope.BillingTypes.length > 0) {
                        var SelectStream1 = [];
                        if (billtype) {

                            SelectStream1 = $filter('filter')($scope.BillingTypes, { BillID: billtype });
                        }
                        return SelectStream1.length ? SelectStream1[0].BillType : 'Select';
                    }
                    else {
                        $notify.warning('warning', "Check Billing Type");
                    }

                };


            });

        }


        $scope.ProjectMappingclick = function (id, ProjName) {
            
            document.getElementById("ProjMappingUserID").value="";
            document.getElementById("ProjMappingRoleID").value="";
            $scope.customRoleNameFilter={};
            $scope.ProjectMapping={};
            $scope.setProjectName = ProjName;
            $scope.setProjectID = id;
            $scope.GetAllProjectMapping = [];
            $scope.FinilizedUserName = [];
            $http.get('/Manage_Rolesshow').then(function (response) {
                $scope.Manage_Roleser = response.data;

            });
            $http.get('/Manage_Usershow1/').then(function (response) {
                $scope.GetAllUserNames = response.data;

                $http.get('/CheckProjectMapping/' + id + '/' + FacilityService).then(function (response) {
                    $scope.GetProjectMapping = response.data;

                    if ($scope.GetProjectMapping.length == 0) {
                        $scope.GetAllProjectMapping = $scope.GetAllUserNames;

                    }
                    else {


                        $scope.FinilizedUserName = response.data;

                        for (i = 0; i < $scope.GetAllUserNames.length; i++) {//20

                            var data = $scope.FinilizedUserName.filter(function (element) {
                                return element.UserName == $scope.GetAllUserNames[i].UserName;
                            })
                            if (data.length == 0) {
                                var obj = {};
                                obj.UserName = $scope.GetAllUserNames[i].UserName;
                                $scope.GetAllProjectMapping.push(obj);
                            }
                            else {
                                $scope.GetAllProjectMapping.push(data[0]);
                            }



                            //delete $scope.GetAllUserNames[0]
                            //$scope.GetProjectMapping = $scope.GetAllUserNames.filter((subject) => subject.UserName != $scope.GetProjectMapping[i].UserName);

                        }



                    }
                });

            });


        }

        $scope.UpdateProjectMapping = function () {
            

            $http.get('/CheckProjectMapping/' + $scope.setProjectID + '/' + FacilityService).then(function (response) {
                $scope.GetProjectMapping = response.data;


                for (i = 0; i < $scope.GetAllProjectMapping.length; i++) {


                    var Allow = $scope.GetAllProjectMapping[i].Allow;

                    if (Allow == undefined) {
                        Allow = false;
                    }




                    var data = $scope.FinilizedUserName.filter(function (element) {
                        return element.UserName == $scope.GetAllProjectMapping[i].UserName;
                    })
                    if (data.length == 0) {
                        $http.post('/InsertProjectMapping', {
                            'ProjectID': $scope.setProjectID,
                            'FacilityID': FacilityService,
                            'UserName': $scope.GetAllProjectMapping[i].UserName,
                            'Allow': Allow,
                            'Role': $scope.GetAllProjectMapping[i].Role,
                        }).then(function (response) {

                        });

                    }
                    else {
                        $http.put('/UpdateProjectMapping', {
                            'ID': $scope.GetAllProjectMapping[i]._id,
                            'ProjectID': $scope.setProjectID,
                            'FacilityID': FacilityService,
                            'UserName': $scope.GetAllProjectMapping[i].UserName,
                            'Allow': Allow,
                            'Role': $scope.GetAllProjectMapping[i].Role,
                        }).then(function (response) {
                        });

                    }












                }
                $('#ProjectMappingModal').modal('hide');
                $notify.success('Success', 'Project Mapping ' + $scope.setProjectName + ' Updated successfully');
            });

        }
        //refresh Function
        var refresh = function () {
            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }
            else {
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;

                    for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                        $scope.GetProjectDetails[i].ActiveStatus = "Active";
                    }

                });
            }
        }

        //Add Duplicate Project Name
        $scope.AddProjectDuplicate = function (prjName) {
            var AddDuplicate = 0;
            for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                if (prjName == $scope.GetProjectDetails[i].ProjectName) {
                    AddDuplicate++;
                }
            }
            if (AddDuplicate != 0) {
                $notify.warning('warning', "Project " + "'" + prjName + "'" + " already exist. Please select a different project name");
                $scope.disableds = true;
            }
            else { $scope.disableds = false; }
        }
        //Update Duplicate Project Name
        $scope.UpdateProjectDuplicate = function (prjName) {
            ;


            for (i = 0; i < $scope.GetProjectDetails.length; i++) {

                var UpdateProjectNameChk = $scope.GetProjectDetails[i].ProjectName;
                if (prjName == UpdateProjectNameChk) {

                    if ($scope.PopupProjectname == prjName && $scope.ProjId == $scope.ProjId) {
                        $scope.disableds = false;
                        return '';
                    }
                    $scope.disableds = true;
                    $notify.warning('Warning', "Facility Name" + " '" + UpdateProjectNameChk + "' " + "is already exist");
                    break;
                }
                else {
                    $scope.disableds = false;
                }
            }
        }


        //Show Client Name
        $scope.showClientName = function (GetProjectDetail) {
            if ($scope.GetClientNames.length > 0) {
                var SelectStream1 = [];
                if (GetProjectDetail.ClientName) {

                    SelectStream1 = $filter('filter')($scope.GetClientNames, { _id: GetProjectDetail.ClientName });
                }
                return SelectStream1.length ? SelectStream1[0].ClientName : 'Select';
            }
            else {

            }


        };


        $scope.showRoleName = function (GetProjectDetail) {
            if ($scope.Manage_Roleser.length > 0) {
                var SelectStream1 = [];
                if (GetProjectDetail.Role) {
                    SelectStream1 = $filter('filter')($scope.Manage_Roleser, { _id: GetProjectDetail.Role });
                }
                return SelectStream1.length ? SelectStream1[0].RoleName : 'Select';
            }
            else {

            }


        };

        $scope.applyHighlight = function ($data) {
            
       
          var dataSpan = $(event.currentTarget).closest('td');
          if (!dataSpan.hasClass("highlighted")) {
              $(dataSpan).addClass("highlighted");
          }
        
       

      }
        var DateCalculation = function (Finish) {
            var day = parseInt(Finish.substring(0, 2));
            var month = parseInt(Finish.substring(3, 5));
            var year = parseInt(Finish.substring(6, 10));
            var date = new Date(year, month - 1, day);
            return date;
        };


        $scope.EndDateEnable = true;
        $scope.StartDateChange = function (date) {
            ;
            $scope.getstartdate = date;
            $scope.EndDateRestrict = date;
            var startDate = $scope.ManageProject.StartDate.split("-");
            var endDate = $scope.ManageProject.EndDate.split("-");

            var startDate1 = $scope.ManageProject.StartDate;
            var endDate2 = $scope.ManageProject.EndDate;

            var curDate = new Date();

            if (startDate[2] < endDate[2]) {
                getdatecalc();
                return;
            }

            if (startDate[2] > endDate[2]) {
                $notify.warning('warning', 'End Date should be greater than start date');
                $scope.disableds = true;
                return false;
            }
            else {
                if (startDate[1] < endDate[1]) {
                    getdatecalc();
                    return true;
                }
                else {
                    if (startDate[1] > endDate[1]) {
                        $notify.warning('warning', 'End Date should be greater than start date');
                        $scope.disableds = true;
                        return false;
                    }
                    else {
                        if (startDate[0] > endDate[0]) {
                            $notify.warning('warning', 'End Date should be greater than start date');
                            $scope.disableds = true;
                            return false;
                        }
                    }
                }
                getdatecalc();
            }


        }

        $scope.EndateChange = function (date) {
            ;
            $scope.EndDateRestrict = date;
            var startDate = $scope.ManageProject.StartDate.split("-");
            var endDate = $scope.ManageProject.EndDate.split("-");

            var startDate1 = $scope.ManageProject.StartDate;
            var endDate2 = $scope.ManageProject.EndDate;

            var curDate = new Date();
            if (startDate[2] < endDate[2]) {
                getdatecalc3();
                return;
            }
            if (startDate[2] > endDate[2]) {
                $notify.warning('warning', 'End Date should be greater than start date');
                $scope.disableds = true;
                return false;
            }
            else {
                if (startDate[1] < endDate[1]) {
                    getdatecalc3();
                    return true;
                }
                else {
                    if (startDate[1] > endDate[1]) {
                        $notify.warning('warning', 'End Date should be greater than start date');
                        $scope.disableds = true;
                        return false;
                    }
                    else {
                        if (startDate[0] > endDate[0]) {
                            $notify.warning('warning', 'End Date should be greater than start date');
                            $scope.disableds = true;
                            return false;
                        }
                    }
                }
                getdatecalc3();
            }



        }

        var getdatecalc = function () {

            var date2 = DateCalculation($scope.ManageProject.EndDate);
            var date1 = DateCalculation($scope.getstartdate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            $scope.ManageProject.EffortsinDays = (Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
            $scope.disableds = false;
        }
        var getdatecalc3 = function () {

            var date2 = DateCalculation($scope.EndDateRestrict);
            var date1 = DateCalculation($scope.getstartdate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            $scope.ManageProject.EffortsinDays = (Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
            $scope.disableds = false;
        }
        var getdatecalc1 = function () {

            var date2 = DateCalculation($scope.EndDateRestrict);
            var date1 = DateCalculation($scope.GetUpdateProjectDetails[0].StartDate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            $scope.GetUpdateProjectDetails[0].EffortInDays = (Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
            $scope.disableds = false;
        }

        var getdatecalc2 = function () {

            var date2 = DateCalculation($scope.GetUpdateProjectDetails[0].EndDate);
            var date1 = DateCalculation($scope.getstartdate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            $scope.GetUpdateProjectDetails[0].EffortInDays = (Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
            $scope.disableds = false;
        }
        ///Update Calendar validation  check
        $scope.UpdateStartDateChange = function (date) {
            ;
            $scope.getstartdate = date;
            var startDate = $scope.GetUpdateProjectDetails[0].StartDate.split("-");
            var endDate = $scope.GetUpdateProjectDetails[0].EndDate.split("-");


            var curDate = new Date();

            if (startDate[2] < endDate[2]) {
                getdatecalc2();
                return;
            }

            if (startDate[2] > endDate[2]) {
                $notify.warning('warning', 'End Date should be greater than start date');
                $scope.disableds = true;
                return false;
            }
            else {
                if (startDate[1] < endDate[1]) {
                    getdatecalc2();
                    return true;
                }
                else {
                    if (startDate[1] > endDate[1]) {
                        $notify.warning('warning', 'End Date should be greater than start date');
                        $scope.disableds = true;
                        return false;
                    }
                    else {
                        if (startDate[0] > endDate[0]) {
                            $notify.warning('warning', 'End Date should be greater than start date');
                            $scope.disableds = true;
                            return false;
                        }
                    }
                }
                getdatecalc2();
                $scope.disableds = false;
            }


        }

        $scope.UpdateEndateChange = function (date) {
            ;
            $scope.EndDateRestrict = date;
            var startDate = $scope.GetUpdateProjectDetails[0].StartDate.split("-");
            var endDate = $scope.GetUpdateProjectDetails[0].EndDate.split("-");


            var curDate = new Date();
            if (startDate[2] < endDate[2]) {
                getdatecalc1();
                return;
            }
            if (startDate[2] > endDate[2]) {
                $notify.warning('warning', 'End Date should be greater than start date');
                $scope.disableds = true;
                return false;
            }
            else {
                if (startDate[1] < endDate[1]) {
                    getdatecalc1();
                    return true;
                }
                else {
                    if (startDate[1] > endDate[1]) {
                        $notify.warning('warning', 'End Date should be greater than start date');
                        $scope.disableds = true;
                        return false;
                    }
                    else {
                        if (startDate[0] > endDate[0]) {
                            $notify.warning('warning', 'End Date should be greater than start date');
                            $scope.disableds = true;
                            return false;
                        }
                    }
                }
                getdatecalc1();
            }


        }

        //Project Update Code
        $scope.UpdateProjectDetails = function () {
            ;
            var dfdg = $scope.GetUpdateProjectDetails[0].ProjectName;
            try {

                if ($scope.GetUpdateProjectDetails[0].Description == undefined || $scope.GetUpdateProjectDetails[0].Description == null || $scope.GetUpdateProjectDetails[0].Description == "") {
                    $scope.GetUpdateProjectDetails[0].Description = "";
                }
                var e = document.getElementById("UpdatePBillingType");
                var BillingTypeValue = parseInt(e.options[e.selectedIndex].value);
                if (BillingTypeValue != 1 || BillingTypeValue != "1") {
                    $scope.GetUpdateProjectDetails[0].EffortInDays = 0;
                    $scope.GetUpdateProjectDetails[0].RevenueInDoller = 0;
                }
                var a = document.getElementById("UpdatePTeamLeader");
                var TeamLeaderID = a.options[a.selectedIndex].value;

                var b = document.getElementById("UpdateProjectStatus");
                var ProjectStatus = parseInt(b.options[b.selectedIndex].value);

                var c = document.getElementById("UpdateProjectClientName");
                var ProjectClient = c.options[c.selectedIndex].value;

                $http.put('/UpdataProjectDetailsData', {
                    'id': EditMasterRowKey,
                    'ProjectName': $scope.GetUpdateProjectDetails[0].ProjectName,
                    'TeamLeaderUserID': TeamLeaderID,
                    'StartDate': $scope.GetUpdateProjectDetails[0].StartDate,
                    'EndDate': $scope.GetUpdateProjectDetails[0].EndDate,
                    'BillingType': BillingTypeValue,
                    'EffortInDays': $scope.GetUpdateProjectDetails[0].EffortInDays,
                    'RevenueInDoller': $scope.GetUpdateProjectDetails[0].RevenueInDoller,
                    'Description': $scope.GetUpdateProjectDetails[0].Description,
                    'ProjectStatus': ProjectStatus,
                    'ClientName': ProjectClient,
                    'UpdatedById': username,
                    'FacilityID': FacilityService,
                    'IsActive': true
                }).then(function (response) {
                    $notify.success('Success', 'Project ' + "'" + $scope.GetUpdateProjectDetails[0].ProjectName + "'" + ' Details Updated successfully');
                    refresh();
                    MainGridRebindBasedTab(tabname);
                    TeamMembersAndDetailsUpdate(TeamLeaderID);
                });
            } catch (error) {
                $notify.warning('warning', error);
            }

        }

        //TeamMembersAndDetailsUpdate
        var TeamMembersAndDetailsUpdate = function (TLID) {
            $http.get('/Getteamdetails/' + FacilityService).then(function (response) {
                $scope.Getteamdetails = response.data;
                $http.get('/GetteamMemberdetails/' + FacilityService).then(function (response) {
                    $scope.GetteamMemberdetails = response.data;

                    if ($scope.Getteamdetails.length > 0) {
                        var SelectStream1 = [];
                        SelectStream1 = $filter('filter')($scope.Getteamdetails, { ProjectName: EditMasterRowKey });
                        if (SelectStream1.length > 0) {
                            $http.put('/projectteamsUpdate', {
                                'id': EditMasterRowKey,
                                'TeamLeaderUserID': TLID
                            }).then(function (response) {

                            });
                        }
                        if ($scope.GetteamMemberdetails.length > 0) {
                            var SelectStream1 = [];
                            SelectStream1 = $filter('filter')($scope.GetteamMemberdetails, { ProjectID: EditMasterRowKey });
                            if (SelectStream1.length > 0) {
                                $http.put('/projectteamsDetailsUpdate', {
                                    'id': EditMasterRowKey,
                                    'TeamLeaderUserID': TLID
                                }).then(function (response) {

                                });
                            }
                        }
                    }
                });
            });
        }


        //Show GridRebindBasedTab
        $scope.GridRebindBasedTab = function (data) {
            if (data == "AP") {
                tabname = "AP";
            }
            if (data == "IP") {
                tabname = "IP";
            }
            if (data == "C") {
                tabname = "C";
            }
            if (data == "D") {
                tabname = "D";
            }
            MainGridRebindBasedTab(data);


        }

        var MainGridRebindBasedTab = function (data) {
            if (data == "AP") {
                $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;


                    for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                        $scope.GetProjectDetails[i].ActiveStatus = "Active";
                    }

                });

            }
            if (data == "IP") {
                $http.get('/GetProjectDetailsINprogress/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;


                    for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                        $scope.GetProjectDetails[i].ActiveStatus = "Active";
                    }

                });

            }
            if (data == "C") {
                $http.get('/GetProjectDetailsComplete/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;

                    for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                        $scope.GetProjectDetails[i].ActiveStatus = "Active";
                    }

                });

            }
            if (data == "D") {
                $http.get('/GetProjectDetailsDelete/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;

                    for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                        $scope.GetProjectDetails[i].ActiveStatus = "Active";
                    }


                });

            }

        }
        //Reactive Code
        $scope.ReActive = function (id) {
            try {
                $http.put('/ProjectReactive', {
                    'id': id

                }).then(function (response) {
                    $notify.success('Success', 'Project Details has been activated successfully');
                    refresh();
                    MainGridRebindBasedTab(tabname);
                });
            } catch (error) {
                $notify.warning('warning', error);
            }


        }
        //Delete code
        $scope.DeleteProjectDetails = function (id) {
            DeleteMasterKey = id;
        }
        $scope.DeleteProjectKey = function (id) {
            ;
            try {
                var ProjectID = DeleteMasterKey;
                $http.get('/GetResourcesBasedProjectDeleteCheck/' + ProjectID).then(function (response) {
                    $scope.GetResourcesBasedProjects = response.data;
                    if ($scope.GetResourcesBasedProjects.length > 0) {
                        $notify.warning('warning', 'Team is allocated to this Project. Project Definition cannot be deleted');
                    }
                    else {
                        $http.put('/DeleteProjectReactive', {
                            'id': DeleteMasterKey

                        }).then(function (response) {
                            $notify.success('Success', 'Project has been deleted successfully');
                            refresh();
                            MainGridRebindBasedTab(tabname);

                        });

                    }

                });

            } catch (error) {
                $notify.warning('warning', error);
            }
        }

        $scope.cancel = function () {

            $scope.ManageProject = '';

        }
        $scope.getDDLValues = function () {
            $http.get('/UserResource123/' + FacilityService).then(function (response) {

                $scope.GetUserNames = response.data;


            });
            $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
                if (data.BillingType.length > 0) {
                    $scope.BillingTypes = data.BillingType;
                }
                else {
                    $notify.warning('warning', "Check Billing Type in json file");
                }
                //Get ProjectStatus  
                $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
                    ;
                    if (data.ProjectStatus.length > 0) {
                        $scope.ProjectStatus = data.ProjectStatus;
                    }
                    else {
                        $notify.warning('warning', "Check Project Status in json file");
                    }


                });

            });

        }
        //Get Client Name
        $http.get('/GetClientName/' + FacilityService).then(function (response) {
            $scope.GetClientNames = response.data;
        });
        //Get Billing Type
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            if (data.BillingType.length > 0) {
                $scope.BillingTypes = data.BillingType;
            }
            else {
                $notify.warning('warning', "Check Billing Type in json file");
            }


        });
        //Get ProjectStatus  
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            ;
            if (data.ProjectStatus.length > 0) {
                $scope.ProjectStatus = data.ProjectStatus;
            }
            else {
                $notify.warning('warning', "Check Project Status in json file");
            }


        });

        //Bill type ng-Change
        $scope.PBillingTypeChange = function () {
            ;
            var e = document.getElementById("PBillingType");
            var BillingTypeValue = parseInt(e.options[e.selectedIndex].value);
            if (BillingTypeValue == 1 || BillingTypeValue == "1") {
                $scope.EffortsinDaysRequired = true;
                $scope.RevenueRequired = true;
            } else {
                $scope.EffortsinDaysRequired = false;
                $scope.RevenueRequired = false;
            }
        }
        //Update Bill type ng-Change
        $scope.UpdatePBillingTypeChange = function () {
            ;
            var e = document.getElementById("UpdatePBillingType");
            var BillingTypeValue = parseInt(e.options[e.selectedIndex].value);
            if (BillingTypeValue == 1 || BillingTypeValue == "1") {
                $scope.UpdateEffortsinDaysRequired = true;
                $scope.UpdateRevenueRequired = true;
            } else {
                $scope.UpdateEffortsinDaysRequired = false;
                $scope.UpdateRevenueRequired = false;
            }
        }




        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;

            $scope.ItemsPerPageCounts1 = data.ItemPerPage;
            $scope.ItemsPerPageCount1 = $scope.ItemsPerPageCounts1[0].PageID;
        });
        $scope.ItemsPerPageChange = function () {

            var e = document.getElementById("ItemsPerPageID1");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount = ItemsPerPageID;
            refresh();
            MainGridRebindBasedTab(tabname);

        }

        var logincheck = function () {
            $http.get('loggedin').success(function (user) {
                // Authenticated
                if (user != '0') {
                    $scope.viewaccesspage = true;
                    refresh();
                    return;
                }
                // Not Authenticated
                else {
                    $scope.ShowBody = false;
                    $scope.viewaccesspage = false;
                    $window.location.href = '/';
                }
            });
        };
        $scope.ShowBody = false;
        logincheck();




    }]);
