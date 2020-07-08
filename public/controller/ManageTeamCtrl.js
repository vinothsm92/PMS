
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var FacilityService = '';
var DeleteRowKey = '';
var ProjectDeleteID = '';


app.run(function (editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
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

app.controller('ManageTeamController', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {
            if (newVal !== '') {
                FacilityService = newVal;
                refresh();
            }
        });
        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;
        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {

            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[7].View;
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

        //refresh
        var refresh = function () {

            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }
            else {
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                // Getproject name from Project Details
                $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;
                    $http.get('/Getteamdetails/' + FacilityService).then(function (response) {
                        $scope.Getteamdetails = response.data;
                        if ($scope.Getteamdetails.length > 0) {
                            //show project Name
                            $scope.showProjectName = function (Getteamdetail) {
                                if ($scope.GetProjectDetails.length > 0) {
                                    var SelectStream1 = [];
                                    if (Getteamdetail) {
                                        SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: Getteamdetail });
                                    }
                                    return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
                                }
                                else {

                                }

                            };
                        }

                    });
                });
            }
        }

        // GetUsername from Users
        $http.get('/UserResource123/' + FacilityService).then(function (response) {

            $scope.GetUserNames = response.data;

        });
        // Getproject name from Project Details
        $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;
        });











        //Project Name Dropdown Change
        $scope.ProjectNameChange = function (ProjectID) {

            $http.get('/Getteamleader/' + ProjectID).then(function (response) {
                $scope.GetteamleaderDetails = response.data;

                if ($scope.GetteamleaderDetails.length > 0) {
                    $scope.Addresourceshow = true;
                }
                else {
                    $scope.Addresourceshow = false;

                }
                $scope.Getresourceviews = [];

            });

        }
        //Add Resources
        $scope.Getresourceviews = [];
        $scope.AddResourceClick = function (index, data) {

            var obj = {}
            obj.TeamMemberUserID = data;
            var ProjectSelectStream = [];
            ProjectSelectStream = $filter('filter')($scope.Getresourceviews, { TeamMemberUserID: data });
            var SelectStream = $scope.Getresourceviews.filter(function (el) {
                return (el.TeamMemberUserID == data);
            });

            if (SelectStream == 0) {
                $scope.Getresourceviews.push(obj);
                $notify.success('Success', 'Selected Resource Added Successfully!');
            }

            else {
                $notify.warning('Success', 'Selected Resource already Exist!');
            }
        }


        var resourcerefresh = function () {
            $http.get('/Getresourceview/' + FacilityService).then(function (response) {
                $scope.Getresourceviews = response.data;
            });
        }
        $scope.AddNewClick = function () {



            $scope.GetNewProjectDetails = [];
            $scope.Addresourceshow = false;

            //get project name to dropdown
            $http.get('/GetProjectDetailsforteam/' + FacilityService).then(function (response) {
                $scope.GetProjectDetails = response.data;
                if ($scope.GetProjectDetails.length > 0) {
                    //get data from ManageTeam
                    $http.get('/GetManageTeamDetails/' + FacilityService).then(function (response) {
                        $scope.GetManageTeamDetails = response.data;

                        if ($scope.GetManageTeamDetails.length > 0) {

                            for (i = 0; i < $scope.GetProjectDetails.length; i++) {
                                var projectid = $scope.GetProjectDetails[i]._id;
                                var ProjectName = $scope.GetProjectDetails[i].ProjectName;
                                var SelectStream = [];
                                SelectStream = $filter('filter')($scope.GetManageTeamDetails, { ProjectName: projectid });
                                if (SelectStream.length == 0) {
                                    var obj = {}
                                    obj._id = projectid;
                                    obj.ProjectName = ProjectName;
                                    $scope.GetNewProjectDetails.push(obj);
                                }


                            }



                        }
                        else {

                            $http.get('/GetProjectDetailsforteam/' + FacilityService).then(function (response) {
                                $scope.GetNewProjectDetails = response.data;

                            });
                        }

                    });
                }
            });



        }
        $scope.cancelclick = function () {

            $scope.GetteamleaderDetails[0].TeamLeaderUserID = '';
            $scope.Addresourceshow = false;

            $scope.GetProjectDetail = null;


        }

        $scope.AddTeamDetails = function () {

            var c = document.getElementById("ProjectIDDrop");
            var ProjectId = c.options[c.selectedIndex].value;
            var TL = $scope.GetteamleaderDetails[0].TeamLeaderUserID;
            var UpdatedById = null;
            $http.post('/AddTeam', {
                'ProjectName': ProjectId,
                'TeamLeader': TL,
                'FacilityID': FacilityService,
                'CreatedById': username,
                'UpdatedById': UpdatedById,
                'IsActive': true
            }).then(function (response) {
                $scope.GetteamleaderDetails[0].TeamLeaderUserID = '';
                $scope.GetProjectDetail._id = '';
                refresh();
            });

            //Resource Members 
            var c = document.getElementById("ProjectIDDrop");
            var ProjectId = c.options[c.selectedIndex].value;
            var TL = $scope.GetteamleaderDetails[0].TeamLeaderUserID;
            var SelectStream = [];
            SelectStream = $filter('filter')($scope.GetProjectDetails, { _id: ProjectId });
            var ProjectNameBasedID = SelectStream[0].ProjectName;
            var UpdatedById = null;
            if ($scope.Getresourceviews.length > 0) {
                for (i = 0; i < $scope.Getresourceviews.length; i++) {
                    var data = $scope.Getresourceviews[i].TeamMemberUserID;
                    $http.post('/AddTeamMembers', {
                        'ProjectID': ProjectId,
                        'TeamLeaderUserID': TL,
                        'TeamMemberUserID': data,
                        'FacilityID': FacilityService,
                        'CreatedById': username,
                        'UpdatedById': UpdatedById,
                        'IsActive': true,
                        'Mail': true,
                        'BillingRateInDoller': 0

                    }).then(function (response) {
                    });
                   // MailSendFunction(TL, data, ProjectNameBasedID);
                }
                $notify.success('Success', 'Resource added to the team successfully!');
            }
        }

        //Mail Code
        var MailSendFunction = function (TL, data, projectname) {

            if ($scope.GetUserNames.length > 0) {
                var SelectStream = [];
                SelectStream = $filter('filter')($scope.GetUserNames, { UserName: data });


                var email = SelectStream[0].Email;

                $http.post('/TeamMemberAlotNotification', {
                    "TeamLeaderID": TL,
                    "ProjectName": projectname,
                    "TeamMember": data,
                    "email": email
                }).then(function (response) {


                });
            }
        }

        //Delete Row Code
        $scope.DeleteTeamDetails = function (rowid, projectid) {
            DeleteRowKey = rowid;
            ProjectDeleteID = projectid;
        }

        $scope.DeleteTeamKey = function () {

            $http.post('/DeleteProjectTeamMembers', {
                'DeleteRowKey': DeleteRowKey,
                'ProjectDeleteID': ProjectDeleteID
            }).then(function (response) {
                $http.post('/DeleteProjectTeamMembersRowKey', {
                    'DeleteRowKey': DeleteRowKey,
                    'ProjectDeleteID': ProjectDeleteID
                }).then(function (response) {

                    refresh();
                    $notify.success('Success', 'Team has been deleted!');

                });

            });

        }


        //Resource Edit Code
        var ProjectID = '';
        $scope.Projectteamclick = function (projectname, teamlead) {

            ProjectID = projectname;
            var SelectStream1 = [];
            SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: ProjectID });
            $scope.EditProjectName = SelectStream1[0].ProjectName;
            $scope.EditTeamLead = teamlead;
            $http.get('/GetResourcesBasedProject/' + ProjectID).then(function (response) {
                $scope.GetResourcesBasedProjects = response.data;
            });

        }

        $scope.EditResourceClick = function (data) {

            var obj = {}
            obj.TeamMemberUserID = data;
            var PrjSelectStream = [];
            PrjSelectStream = $filter('filter')($scope.GetResourcesBasedProjects, { TeamMemberUserID: data });

            var SelectStream = $scope.GetResourcesBasedProjects.filter(function (el) {
                return (el.TeamMemberUserID == data);
            });

            if (SelectStream == 0) {
                $scope.GetResourcesBasedProjects.push(obj);
            }

        }

        $scope.EditTeamResourceClick = function (index, data) {
            
            $scope.GetResourcesBasedProjects.splice(index, 1);
        }
        $scope.TeamResourceClick = function (index, data) {

            $scope.Getresourceviews.splice(index, 1);
        }
        $scope.SaveEditedTeamResources = function () {

            $scope.AddEditResourcesBasedProject = [];
            $http.get('/GetResourcesBasedProject/' + ProjectID).then(function (response) {
                $scope.GetMainResourcesBasedProjects = response.data;


                for (i = 0; i < $scope.GetResourcesBasedProjects.length; i++) {
                    var user = $scope.GetResourcesBasedProjects[i].TeamMemberUserID;
                    var prjSelectStream = [];
                    prjSelectStream = $filter('filter')($scope.GetMainResourcesBasedProjects, { TeamMemberUserID: user });
                    var SelectStream = $scope.GetMainResourcesBasedProjects.filter(function (el) {
                        return (el.TeamMemberUserID == user);
                    });
                    if (SelectStream != 0) {
                        var obj = {}
                        obj.ProjectID = SelectStream[0].ProjectID,
                            obj.TeamLeaderUserID = SelectStream[0].TeamLeaderUserID,
                            obj.TeamMemberUserID = SelectStream[0].TeamMemberUserID,
                            obj.FacilityID = SelectStream[0].FacilityID,
                            obj.CreatedById = SelectStream[0].CreatedById,
                            obj.UpdatedById = SelectStream[0].UpdatedById,
                            obj.IsActive = SelectStream[0].IsActive,
                            obj.Mail = SelectStream[0].Mail,
                            obj.BillingRateInDoller = SelectStream[0].BillingRateInDoller
                        $scope.AddEditResourcesBasedProject.push(obj);
                    }
                    if (SelectStream == 0) {
                        var obj = {}
                        obj.ProjectID = ProjectID,
                            obj.TeamLeaderUserID = $scope.EditTeamLead,
                            obj.TeamMemberUserID = user,
                            obj.FacilityID = FacilityService,
                            obj.CreatedById = username,
                            obj.UpdatedById = username,
                            obj.IsActive = true,
                            obj.Mail = true,
                            obj.BillingRateInDoller = 0
                        $scope.AddEditResourcesBasedProject.push(obj);
                        var SelectStream = [];
                        SelectStream = $filter('filter')($scope.GetProjectDetails, { _id: ProjectID });
                        var ProjectNameBasedID = SelectStream[0].ProjectName;
                       // MailSendFunction($scope.EditTeamLead, user, ProjectNameBasedID);

                    }
                }
                $http.post('/UpdateResourcesBasedProject/' + ProjectID, $scope.AddEditResourcesBasedProject).then(function (response) {
                    $notify.success('Success', 'Selected Resource Updated Successfully!');

                });

            });

        }

        //Billing popup Code
        $scope.ProjectBillingclick = function (ProjectID) {

            $http.get('/GetResourcesBasedProject/' + ProjectID).then(function (response) {
                $scope.GetProjectBillings = response.data;
                if ($scope.GetProjectBillings.length == 0) {
                    $notify.warning('warning', 'No Records to Display. Assign Team Resources!');

                } else {

                    $scope.showProjectNameEdit = function (GetteamdetailBill) {
                        if ($scope.GetProjectDetails.length > 0) {
                            var SelectStream1 = [];
                            if (GetteamdetailBill) {
                                SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: GetteamdetailBill });
                            }
                            return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
                        }
                        else {

                        }


                    };
                }
            });

        }
        //Save Billing popup Code
        $scope.SaveBillingDate = function () {

            for (i = 0; i < $scope.GetProjectBillings.length; i++) {

                var id = $scope.GetProjectBillings[i]._id;
                var BillingRate = $scope.GetProjectBillings[i].BillingRateInDoller;

                $http.put('/UpdateBillingRateValues', {
                    'id': id,
                    'BillingRate': BillingRate
                }).then(function (response) {

                });

            }
            $notify.success('Success', 'Billing rate saved successfully');

        }



        //Filter Code
        //Custom Filter  for building name
        $scope.ProjectNameFilter = function (data) {

            $scope.FProjectName = data;
        };


        $scope.customProjectNameFilter = function (Getteamdetail) {

            if ($scope.FProjectName == undefined) { return true }
            else {
                var mstream = $scope.showProjectName(Getteamdetail.ProjectName);
                return (mstream.toLowerCase().indexOf($scope.FProjectName.toLowerCase()) !== -1);
            }
        };
        //Pagination Code
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;
        });
        $scope.ItemsPerPageChange = function () {

            var e = document.getElementById("ItemsPerPageID");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount = ItemsPerPageID;

            refresh();

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
