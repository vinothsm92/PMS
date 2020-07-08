
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;


var DeleteClientMasterKey = '';


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

app.controller('TimeSheetReport', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


        $scope.Resourcemodel = [];
        //  $scope.Resourcedata = [ {id: 1, label: "David"}, {id: 2, label: "Jhon"}, {id: 3, label: "Danny"} ]; 
        $scope.Resourcesettings = {
            checkBoxes: true,
            dynamicTitle: true,
            showUncheckAll: true,
            showCheckAll: true,
            enableSearch: true,
            scrollableHeight: 'calc(100vh - 300px)',
            scrollable: true,
        };
        $scope.Projectmodel = [];
        //  $scope.Projectdata = [ {id: 1, label: "David"}, {id: 2, label: "Jhon"}, {id: 3, label: "Danny"} ]; 
        $scope.Projectsettings = {
            checkBoxes: true,
            dynamicTitle: true,
            showUncheckAll: true,
            showCheckAll: true,
            enableSearch: true,
            scrollableHeight: 'calc(100vh - 300px)',
            scrollable: true,
        };

        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {

            if (newVal !== '') {
                FacilityService = newVal;
                $scope.FileUploadVisible = false;
                $scope.ShowGrid = false;
                $scope.ShowButton = false;
                $scope.ProjectName = {};


                $scope.GetUserName = {};
                $scope.From = {};
                document.getElementById("AddEndDate").value = "";
                refresh();
                $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;

                    $scope.showProjectName = function (id) {

                        if ($scope.GetProjectDetails.length > 0) {
                            var SelectStream1 = [];
                            if (id) {
                                SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: id });
                            }
                            return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
                        }
                        else {

                        }


                    };
                });
                // $http.get('/GetProjectNamesfortask/' + FacilityService).then(function (response) {
                //     $scope.GetNewProjectDetails = response.data;
                // });
                // $http.get('/UserResource123/' + FacilityService).then(function (response) {

                //     $scope.GetUserNames = response.data;

                //     $scope.Resourcedata = response.data;
                //     for (i = 0; i < $scope.Resourcedata.length; i++) {
                //         $scope.Resourcedata[i].label = $scope.Resourcedata[i]['UserName'];
                //         delete $scope.Resourcedata[i].UserName;
                //     }
                // });

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
                    var access = $scope.role[0].UIList[12].View;
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
        // $http.get('/GetProjectNamesfortask/' + FacilityService).then(function (response) {
        //     $scope.GetNewProjectDetails = response.data;
        // });
        var refresh = function () {

            // $scope.GetNewProjectDetails = null;

            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }

            else {

                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $http.get('/ViewFacility').then(function (response) {
                    $scope.ViewFacilitys = response.data;

                    $http.get('/GetResourceSalary/' + FacilityService).then(function (response) {
                        $scope.GetResourceCost = response.data;
                    });



                });


            }

            $scope.getuserProject = function (Resourcemodel) {


                $scope.Projectdata = [];
                $scope.AllResourceName = "";

                for (Rname = 0; Rname < $scope.Resourcemodel.length; Rname++) {
                    if (Rname == 0) {
                        $scope.AllResourceName = $scope.Resourcemodel[Rname].label;
                    }
                    else {
                        $scope.AllResourceName += ',' + $scope.Resourcemodel[Rname].label;
                    }
                }
                if (Resourcemodel.length == 0 || Resourcemodel.length == undefined || Resourcemodel.length == "") {

                    return true
                }
                else {

                    $scope.ShowGrid = false;



                    for (count = 0; count < $scope.Resourcemodel.length; count++) {
                        GetUserName = $scope.Resourcemodel[count].label;
                        // $scope.From = {};

                        //  document.getElementById("AddStartDate").value = "";

                        $http.get('/GetProjNameByUser/' + GetUserName + '/' + FacilityService).then(function (response) {
                            for (i = 0; i < response.data.length; i++) {
                                $scope.Projectmodel = [];
                                SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });



                                $scope.Projectdata.push({ "label": SelectStream1.length ? SelectStream1[0].ProjectName : 'Select' });


                            }

                            $scope.Projectdata = removeDuplicates($scope.Projectdata, 'label');
                            function removeDuplicates(originalArray, prop) {
                                var newArray = [];
                                var lookupObject = {};

                                for (var i in originalArray) {
                                    lookupObject[originalArray[i][prop]] = originalArray[i];
                                }

                                for (i in lookupObject) {
                                    newArray.push(lookupObject[i]);
                                }
                                return newArray;
                            }

                            // usage example:




                        });

                    }

                }
            }
        }



        var MainTabText = '';
        $scope.Grid1visile = true;

        
        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;


        });
        $http.get('/Manage_Usershow1').then(function (response) {

            $scope.GetUsersDetails = response.data;

            $scope.GetuserRole = $scope.GetUsersDetails.filter(function (el) {
                return el.UserName == username;
            })
            $scope.Role = false;
            if ($scope.GetuserRole[0].Role == '59240ca091c11112f42ec22f') { //Admin
                $http.get('/GetProj/' + FacilityService).then(function (response) {
                    $scope.Projectdata = response.data;
                    for (i = 0; i < $scope.Projectdata.length; i++) {
                        $scope.Projectdata[i].label = $scope.Projectdata[i]['ProjectName'];
                        delete $scope.Projectdata[i].ProjectName;
                    }
                });
            }
            else if ($scope.GetuserRole[0].Role == '5ad0462b8b9b74bc0c6d2cb8') //Employee
            {
                $scope.Role = true;
                $http.get('/GetProjNameByUser/' + username + '/' + FacilityService).then(function (response) {



                    $scope.Projectdata = [];


                    for (i = 0; i < response.data.length; i++) {
                        $scope.Projectdata1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });

                        $scope.Projectdata.push({ label: $scope.Projectdata1[0].ProjectName })
                    }
                    $scope.Projectdata.sort(function (a, b) {
                        if (a.label < b.label) return -1;
                        if (a.label > b.label) return 1;
                        return 0;
                    })
                });
            }
            else if ($scope.GetuserRole[0].Role == '5ad59af3fd471db415f8d5f1') { //TeamLead
                $scope.Projectdata = [];
                $http.get('/GetTeamLeadProjectProj/' + username).then(function (response) {
                    $scope.Projectdata = response.data;
                    for (i = 0; i < $scope.Projectdata.length; i++) {
                        $scope.Projectdata[i].label = $scope.Projectdata[i]['ProjectName'];
                        delete $scope.Projectdata[i].ProjectName;
                    }
                });

                $http.get('/GetProjNameByUser/' + username + '/' + FacilityService).then(function (response) {

                    for (i = 0; i < response.data.length; i++) {
                        $scope.Projectdata1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });
                        $scope.Projectdata.push({ label: $scope.Projectdata1[0].ProjectName, _id: $scope.Projectdata1[0]._id })
                    }
                    $scope.Projectdata.sort(function (a, b) {
                        if (a.label < b.label) return -1;
                        if (a.label > b.label) return 1;
                        return 0;
                    })

                    $scope.Projectdata = Object.values($scope.Projectdata.reduce((acc, cur) => Object.assign(acc, { [cur.label]: cur }), {}))
                });
            }
        });

        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;

            $scope.showProjectName = function (id) {

                if ($scope.GetProjectDetails.length > 0) {
                    var SelectStream1 = [];
                    if (id) {
                        SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: id });
                    }
                    return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
                }
                else {

                }


            };
        }); var GetUserName = "";
        var getuserprojbyfacility = function () {
            $scope.ShowGrid = false;
            $scope.ShowButton = false;
            $scope.ProjectName = {};


            GetUserName = document.getElementById("UserNameID").value;
            $scope.From = {};

            // document.getElementById("AddStartDate").value = "";
            document.getElementById("AddEndDate").value = "";
            $http.get('/GetProjNameByUser/' + GetUserName + '/' + FacilityService).then(function (response) {

                $scope.Projectdata += response.data;


            });
        }
        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;

            $scope.showProjectName = function (id) {




            };
        });
        $scope.getuserProject = function (Resourcemodel) {

            // $scope.Projectdata = [];
            $scope.AllResourceName = "";

            for (Rname = 0; Rname < $scope.Resourcemodel.length; Rname++) {
                if (Rname == 0) {
                    $scope.AllResourceName = $scope.Resourcemodel[Rname].label;
                }
                else {
                    $scope.AllResourceName += ',' + $scope.Resourcemodel[Rname].label;
                }
            }
            if (Resourcemodel.length == 0 || Resourcemodel.length == undefined || Resourcemodel.length == "") {

                return true
            }
            else {

                $scope.ShowGrid = false;



                for (count = 0; count < $scope.Resourcemodel.length; count++) {
                    GetUserName = $scope.Resourcemodel[count].label;
                    $scope.From = {};

                    // document.getElementById("AddStartDate").value = "";
                    // document.getElementById("AddEndDate").value = "";
                    $http.get('/GetProjNameByUser/' + GetUserName + '/' + FacilityService).then(function (response) {
                        for (i = 0; i < response.data.length; i++) {
                            $scope.Projectmodel = [];
                            SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });



                            $scope.Projectdata.push({ "label": SelectStream1.length ? SelectStream1[0].ProjectName : 'Select' });


                        }

                        $scope.Projectdata = removeDuplicates($scope.Projectdata, 'label');
                        function removeDuplicates(originalArray, prop) {
                            var newArray = [];
                            var lookupObject = {};

                            for (var i in originalArray) {
                                lookupObject[originalArray[i][prop]] = originalArray[i];
                            }

                            for (i in lookupObject) {
                                newArray.push(lookupObject[i]);
                            }
                            return newArray;
                        }

                        // usage example:




                    });

                }

            }
        }



        $scope.getProject = function (Projectmodel) {
            if (Projectmodel.length == 0 || Projectmodel == undefined) {
                $scope.Resourcedata = [];
                return true
            }
            if ($scope.GetuserRole[0].Role == '5ad0462b8b9b74bc0c6d2cb8') //Employee
            {

                $scope.TeamLeadProject = [];
                $scope.Resourcedata = [];
                for (i = 0; i < Projectmodel.length; i++) {
                    var CheckTL = $filter('filter')($scope.GetProjectDetails, { ProjectName: Projectmodel[i].label, TeamLeaderUserID: username });

                    if (CheckTL.length == 0) {

                        function checkAndAdd(name) {

                            var found = $scope.Resourcedata.some(function (el) {
                                return el.label === name;
                            });
                            if (!found) {
                                var ActiveUser = $scope.GetUsersDetails.filter(function (el) {
                                    return el.UserName == username, el.IsActive == true
                                })
                                if (ActiveUser.length == 0) { } else {
                                    $scope.Resourcedata.push({ label: username });
                                }
                            }
                        }


                        checkAndAdd(username)

                    }
                    else {
                        CheckTL[0].label = CheckTL[0].ProjectName;
                        $scope.TeamLeadProject.push(CheckTL[0])
                    }
                }

                if ($scope.TeamLeadProject.length == 0) {
                    return;
                }
            }
            else if ($scope.GetuserRole[0].Role == '59240ca091c11112f42ec22f') { // Admin
                if (Projectmodel.length == 0) {
                    $scope.Resourcedata = [];

                }
                $scope.AllProjectName = "";

                for (Rname = 0; Rname < $scope.Projectmodel.length; Rname++) {
                    if (Rname == 0) {
                        $scope.AllProjectName = $scope.Projectmodel[Rname].label;
                    }
                    else {
                        $scope.AllProjectName += ',' + $scope.Projectmodel[Rname].label;
                    }
                }
                // if ($scope.Projectmodel.length == 0 || $scope.Projectmodel.length == null) {
                //     $notify.warning('Warning', 'Please Select the Resource Name');
                //     return true;
                // }
                // $scope.AllProjectName = "";

                for (Rname = 0; Rname < $scope.Projectmodel.length; Rname++) {
                    if (Rname == 0) {
                        $scope.AllProjectName = $scope.Projectmodel[Rname].label;
                    }
                    else {
                        $scope.AllProjectName += ',' + $scope.Projectmodel[Rname].label;
                    }
                }
                if (Projectmodel.length == 0 || Projectmodel.length == undefined || Projectmodel.length == "") {

                    return true
                }
                else {

                    $scope.ShowGrid = false;

                    $scope.Resourcedata = [];

                    for (count = 0; count < $scope.Projectmodel.length; count++) {
                        ProjectID = $scope.Projectmodel[count].label;

                        Project_ID = $scope.Projectdata.filter(function (el) {
                            return el.label == ProjectID
                        })
                        // document.getElementById("AddStartDate").value = "";
                        // document.getElementById("AddEndDate").value = "";
                        $http.get('/GetProjUserName/' + FacilityService + '/' + Project_ID[0]._id).then(function (response) {
                            for (i = 0; i < response.data.length; i++) {
                                $scope.Resourcemodel = [];
                                // SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });


                                var ActiveUser = $scope.GetUsersDetails.filter(function (el) {
                                    return el.UserName == response.data[i].TeamMemberUserID && el.IsActive == true
                                })
                                if (ActiveUser.length == 0) { } else {
                                    $scope.Resourcedata.push({ label: response.data[i].TeamMemberUserID });
                                }
                                // $scope.Resourcedata.push({ "label": response.data[i].TeamMemberUserID });


                            }

                            $scope.Resourcedata = removeDuplicates($scope.Resourcedata, 'label');
                            function removeDuplicates(originalArray, prop) {
                                var newArray = [];
                                var lookupObject = {};

                                for (var i in originalArray) {
                                    lookupObject[originalArray[i][prop]] = originalArray[i];
                                }

                                for (i in lookupObject) {
                                    newArray.push(lookupObject[i]);
                                }
                                return newArray;
                            }

                            // usage example:

                            $scope.Resourcedata.sort(function (a, b) {
                                var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase()
                                if (nameA < nameB) //sort string ascending
                                    return -1
                                if (nameA > nameB)
                                    return 1
                                return 0 //default return value (no sorting)
                            })


                        });

                    }

                }
            }
            else{
                $scope.TeamLeadProject = [];
                $scope.Resourcedata = [];
                for (i = 0; i < Projectmodel.length; i++) {
                    var CheckTL = $filter('filter')($scope.GetProjectDetails, { ProjectName: Projectmodel[i].label, TeamLeaderUserID: username });
    
                    if (CheckTL.length == 0) {
    
                        function checkAndAdd(name) {
    
                            var found = $scope.Resourcedata.some(function (el) {
                                return el.label === name;
                            });
                            if (!found) {
                                var ActiveUser = $scope.GetUsersDetails.filter(function (el) {
                                    return el.UserName == username, el.IsActive == true
                                })
                                if (ActiveUser.length == 0) { } else {
                                    $scope.Resourcedata.push({ label: username });
                                }
                            }
                        }
    
    
                        checkAndAdd(username)
    
                    }
                    else {
                        CheckTL[0].label = CheckTL[0].ProjectName;
                        $scope.TeamLeadProject.push(CheckTL[0])
                    }
                }
    
                if ($scope.TeamLeadProject.length == 0) {
                    return;
                }
                if ($scope.GetuserRole[0].Role == '5ad0462b8b9b74bc0c6d2cb8') //Employee
                {
                    $scope.Resourcedata = [{ label: username }]
                }
                else { //TeamLead & Admin
                    if (Projectmodel.length == 0) {
                        $scope.Resourcedata = [];
    
                    }
                    $scope.AllProjectName = "";
    
                    for (Rname = 0; Rname < $scope.Projectmodel.length; Rname++) {
                        if (Rname == 0) {
                            $scope.AllProjectName = $scope.Projectmodel[Rname].label;
                        }
                        else {
                            $scope.AllProjectName += ',' + $scope.Projectmodel[Rname].label;
                        }
                    }
                    // if ($scope.Projectmodel.length == 0 || $scope.Projectmodel.length == null) {
                    //     $notify.warning('Warning', 'Please Select the Resource Name');
                    //     return true;
                    // }
                    // $scope.AllProjectName = "";
    
                    for (Rname = 0; Rname < $scope.Projectmodel.length; Rname++) {
                        if (Rname == 0) {
                            $scope.AllProjectName = $scope.Projectmodel[Rname].label;
                        }
                        else {
                            $scope.AllProjectName += ',' + $scope.Projectmodel[Rname].label;
                        }
                    }
                    if (Projectmodel.length == 0 || Projectmodel.length == undefined || Projectmodel.length == "") {
    
                        return true
                    }
                    else {
    
                        $scope.ShowGrid = false;
    
                        $scope.Resourcedata = [];
    
                        for (count = 0; count < $scope.TeamLeadProject.length; count++) {
                            ProjectID = $scope.TeamLeadProject[count].label;
    
                            Project_ID = $scope.Projectdata.filter(function (el) {
                                return el.label == ProjectID
                            })
                            // document.getElementById("AddStartDate").value = "";
                            // document.getElementById("AddEndDate").value = "";
                            $http.get('/GetProjUserName/' + FacilityService + '/' + Project_ID[0]._id).then(function (response) {
                                for (i = 0; i < response.data.length; i++) {
                                    $scope.Resourcemodel = [];
                                    // SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: response.data[i].ProjectID });
    
    
                                    var ActiveUser = $scope.GetUsersDetails.filter(function (el) {
                                        return el.UserName == response.data[i].TeamMemberUserID && el.IsActive == true
                                    })
                                    if (ActiveUser.length == 0) { } else {
                                        $scope.Resourcedata.push({ label: response.data[i].TeamMemberUserID });
                                    }
                                    // $scope.Resourcedata.push({ "label": response.data[i].TeamMemberUserID });
    
    
                                }
    
                                $scope.Resourcedata = removeDuplicates($scope.Resourcedata, 'label');
                                function removeDuplicates(originalArray, prop) {
                                    var newArray = [];
                                    var lookupObject = {};
    
                                    for (var i in originalArray) {
                                        lookupObject[originalArray[i][prop]] = originalArray[i];
                                    }
    
                                    for (i in lookupObject) {
                                        newArray.push(lookupObject[i]);
                                    }
                                    return newArray;
                                }
    
                                // usage example:
    
                                $scope.Resourcedata.sort(function (a, b) {
                                    var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase()
                                    if (nameA < nameB) //sort string ascending
                                        return -1
                                    if (nameA > nameB)
                                        return 1
                                    return 0 //default return value (no sorting)
                                })
    
    
                            });
    
                        }
    
                    }
                }
            }






        }
        $scope.FromDate = function () {

            $scope.To = {};
            if ($scope.Resourcemodel.length == 0 || $scope.Resourcemodel.length == null) {
                $notify.warning('warning', "Please Select Resource Name");

                $scope.From = {};
                $scope.To = {};
                return true;
            }
            if ($scope.Projectmodel.length == 0 || $scope.Projectmodel.length == null) {

                $notify.warning('warning', "Please Select Project Name");

                $scope.From = {};
                $scope.To = {};
                return true;

            }

        }


        $scope.ToDate = function () {


            Warning();
            var Startdate = document.getElementById("AddStartDate").value;
            var Enddate = document.getElementById("AddEndDate").value;
            Start = Startdate.split("-");
            End = Enddate.split("-");
            Syear = Start[2];
            Smonth = Start[1] - 1;
            SDate = Start[0];
            Eyear = End[2];
            Emonth = End[1] - 1;
            EDate = End[0];
            var From = new Date(Syear, Smonth, SDate);
            var Endd = new Date(Eyear, Emonth, EDate);
            if (From > Endd) {
                $notify.warning('warning', "End date Should be greater than Start Date");

                $scope.To = {};
                return true;

            }

        }

        var Warning = function () {

            if ($scope.Resourcemodel.length == 0 || $scope.Resourcemodel.length == null) {
                $notify.warning('warning', "Please Select Resource Name");
                $("div#divLoading").removeClass('show');
                $scope.From = {};
                $scope.To = {};
                return true;
            }
            if ($scope.Projectmodel.length == 0 || $scope.Projectmodel.length == null) {

                $notify.warning('warning', "Please Select Project Name");
                $("div#divLoading").removeClass('show');
                $scope.From = {};
                $scope.To = {};
                return true;

            }
            var Startdate = document.getElementById("AddStartDate").value
            if (Startdate == "" || Startdate == null || Startdate == undefined) {
                $("div#divLoading").removeClass('show');

                $notify.warning('warning', "Please Select From Date");

                $scope.From = {};
                $scope.To = {};
                return true;

            }

            var Enddate = document.getElementById("AddEndDate").value
            if (Enddate == "" || Enddate == null || Enddate == undefined) {
                $("div#divLoading").removeClass('show');

                $notify.warning('warning', "Please Select End Date");

                //  $scope.From = {};
                $scope.To = {};
                return true;

            }
        }

        $scope.GO = function (startDate, endDate) {

            $("div#divLoading").addClass('show');
            $scope.CheckTotalcount = 0;
            $scope.TotalCount = $scope.Projectmodel.length * $scope.Resourcemodel.length;
            ReportType = document.getElementById('Report').value;
            if (!ReportType) {
                $("div#divLoading").removeClass('show');
                $notify.warning('warning', "Please Select Report Type");
                return;
            }
            $scope.TimeSheetReport = [];
            $scope.getAllDates = [];
            $scope.getAllDate = [];
            Warning();
            var getDates = function (startDate, endDate) {
                var dates = [],
                    currentDate = startDate,
                    addDays = function (days) {
                        var date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    };
                while (currentDate <= endDate) {
                    dates.push(currentDate);
                    currentDate = addDays.call(currentDate, 1);
                }
                return dates;
            };

            // Usage

            Start = startDate.split("-");
            End = endDate.split("-");
            Syear = Start[2];
            Smonth = Start[1] - 1;
            SDate = Start[0];
            Eyear = End[2];
            Emonth = End[1] - 1;
            EDate = End[0];
            var dates = getDates(new Date(Syear, Smonth, SDate), new Date(Eyear, Emonth, EDate));
            dates.forEach(function (date) {
                $scope.getAllDates.push(date);
            });
            $scope.ShowGrid = true;





            for (d = 0; d < $scope.getAllDates.length; d++) {

                var dateString = $scope.getAllDates[d];
                var date = new Date(dateString);
                var yr = date.getFullYear();
                var mo = date.getMonth() + 1;
                var day = date.getDate();

                if (mo < 10) {
                    mo = '0' + mo;
                }
                if (day < 10) {
                    day = '0' + day;
                }
                $scope.getAllDate.push(day + '-' + mo + '-' + yr);
            }



            for (ResorName = 0; ResorName < $scope.Resourcemodel.length; ResorName++) {
                for (ProjData = 0; ProjData < $scope.Projectmodel.length; ProjData++) {

                    SelectStream1 = $filter('filter')($scope.GetProjectDetails, { ProjectName: $scope.Projectmodel[ProjData].label });
                    if (ReportType == "TimeSheet") {
                        $http.get('/TimeSheetPublishedReport/' + $scope.Resourcemodel[ResorName].label + '/' + FacilityService + '/' + SelectStream1[0]._id).then(function (response) {
                            $scope.TimeSheetReports = response.data;
                            $scope.CheckTotalcount += 1;
                            if ($scope.TimeSheetReports.length > 0) {
                                if ($scope.TimeSheetReports[0].UserName == 'Vinoth' && $scope.TimeSheetReports[0].ProjectID == '5b154e05e0ad8be81f4ed772') {
                                    
                                    var a = 0;
                                }
                            }
                            if ($scope.TimeSheetReports.length == 0) {
                                if ($scope.TotalCount == $scope.CheckTotalcount) { $("div#divLoading").removeClass('show'); }
                            } else {
                                const monthNames = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                ];
                                const DateNumber = ["Zero", "One", "Two", "Three", "Four", "Five", "Six",
                                    "Seven", "Eight", "Nine", "Ten", "Eleven", "Tweleve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
                                    "Nineteen", "Twenty", "TwentyOne", "TwentyTwo", "TwentyThree", "TwentyFour", "TwentyFive", "TwentySix",
                                    "TwentySeven", "TwentyEight", "TwentyNine", "Thirty", "ThirtyOne"
                                ];



                                for (i = 0; i < $scope.TimeSheetReports.length; i++) {
                                    ChkMonth = $scope.TimeSheetReports[i].Date.split("-");

                                    Smonth = ChkMonth[1] - 1;

                                    var month = monthNames[Smonth];
                                    $scope.TimeSheetReports[i]["Month"] = month;
                                    $scope.TimeSheetReports[i][DateNumber[parseInt(ChkMonth[0])]] = $scope.TimeSheetReports[i].Hours;
                                }

                                for (i = 0; i < $scope.getAllDates.length; i++) {
                                    SelectedDated = $scope.getAllDate[i];
                                    var Reports = $filter('filter')($scope.TimeSheetReports, { Date: SelectedDated });
                                    for (j = 0; j < Reports.length; j++) {
                                        if ($scope.TimeSheetReport.length == 0) {
                                            $scope.TimeSheetReport.push(Reports[j]);
                                        }
                                        else {
                                            var index = $scope.TimeSheetReport.filter(function (img) { return img.Task == Reports[j].Task && img.UserName == Reports[j].UserName && img.Comments == Reports[j].Comments && img.ProjectID == Reports[j].ProjectID && img.Month == Reports[j].Month && img.Date == Reports[j].Date })
                                            if (index.length == 0) {
                                                $scope.TimeSheetReport.push(Reports[j]);
                                            }
                                            else {
                                                var index = $scope.TimeSheetReport.map(function (img) { return img.Task }).indexOf(Reports[j].Task);
                                                if (index == 0) {
                                                    $scope.TimeSheetReport.push(Reports[j]);
                                                }
                                                else {
                                                    var index1 = $scope.TimeSheetReport.map(function (img) { return img.UserName }).indexOf(Reports[j].UserName);
                                                    if (index1 == 0) {
                                                        $scope.TimeSheetReport.push(Reports[j]);
                                                    }
                                                    else {
                                                        var index2 = $scope.TimeSheetReport.map(function (img) { return img.Comments }).indexOf(Reports[j].Comments);
                                                        if (index2 == 0) {
                                                            $scope.TimeSheetReport.push(Reports[j]);
                                                        }
                                                        else {
                                                            var index3 = $scope.TimeSheetReport.map(function (img) { return img.ProjectID }).indexOf(Reports[j].ProjectID);
                                                            if (index3 == 0) {
                                                                $scope.TimeSheetReport.push(Reports[j]);
                                                            }
                                                            else {

                                                                var index4 = $scope.TimeSheetReport.map(function (img) { return img.Month }).indexOf(Reports[j].Month);
                                                                if (index4 == 0) {
                                                                    $scope.TimeSheetReport.push(Reports[j]);
                                                                }
                                                                else {


                                                                    chkDate = Reports[j].Date.split("-");
                                                                    GetDate = parseInt(chkDate[0]);
                                                                    DayHours = Reports[j].Hours || 0;
                                                                    var sdf = $scope.TimeSheetReport[i][DateNumber[GetDate]];
                                                                    if ($scope.TimeSheetReport[i][DateNumber[GetDate]] == undefined) {

                                                                        OldHours = 0;
                                                                    }
                                                                    else {
                                                                        OldHours = $scope.TimeSheetReport[i][DateNumber[GetDate]] || 0;
                                                                    }
                                                                    TotHours = OldHours + DayHours
                                                                    $scope.TimeSheetReport[i][DateNumber[GetDate]] = TotHours;
                                                                }
                                                            }
                                                        }



                                                    }
                                                }
                                            }


                                        }
                                    }

                                }


                                if ($scope.TotalCount == $scope.CheckTotalcount) { $("div#divLoading").removeClass('show'); }
                            }

                        });
                    }
                    else {
                        $http.get('/TeamLeadTimeSheetPublishedReport/' + $scope.Resourcemodel[ResorName].label + '/' + FacilityService + '/' + SelectStream1[0]._id).then(function (response) {
                            $scope.TimeSheetReports = response.data;
                            $scope.CheckTotalcount += 1;
                            if ($scope.TimeSheetReports.length == 0) { if ($scope.TotalCount == $scope.CheckTotalcount) { $("div#divLoading").removeClass('show'); } }
                            else {
                                const monthNames = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                ];
                                const DateNumber = ["Zero", "One", "Two", "Three", "Four", "Five", "Six",
                                    "Seven", "Eight", "Nine", "Ten", "Eleven", "Tweleve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
                                    "Nineteen", "Twenty", "TwentyOne", "TwentyTwo", "TwentyThree", "TwentyFour", "TwentyFive", "TwentySix",
                                    "TwentySeven", "TwentyEight", "TwentyNine", "Thirty", "ThirtyOne"
                                ];



                                for (i = 0; i < $scope.TimeSheetReports.length; i++) {
                                    ChkMonth = $scope.TimeSheetReports[i].Date.split("-");

                                    Smonth = ChkMonth[1] - 1;

                                    var month = monthNames[Smonth];
                                    $scope.TimeSheetReports[i]["Month"] = month;
                                    $scope.TimeSheetReports[i][DateNumber[parseInt(ChkMonth[0])]] = $scope.TimeSheetReports[i].Hours;
                                }

                                for (i = 0; i < $scope.getAllDates.length; i++) {
                                    SelectedDated = $scope.getAllDate[i];
                                    var Reports = $filter('filter')($scope.TimeSheetReports, { Date: SelectedDated });
                                    for (j = 0; j < Reports.length; j++) {
                                        if ($scope.TimeSheetReport.length == 0) {
                                            $scope.TimeSheetReport.push(Reports[j]);
                                        }
                                        else {
                                            var index = $scope.TimeSheetReport.filter(function (img) { return img.Task == Reports[j].Task && img.UserName == Reports[j].UserName && img.Comments == Reports[j].Comments && img.ProjectID == Reports[j].ProjectID && img.Month == Reports[j].Month && img.Date == Reports[j].Date })
                                            if (index.length == 0) {
                                                $scope.TimeSheetReport.push(Reports[j]);
                                            }
                                            else {
                                                var index = $scope.TimeSheetReport.map(function (img) { return img.Task }).indexOf(Reports[j].Task);
                                                if (index == 0) {
                                                    $scope.TimeSheetReport.push(Reports[j]);
                                                }
                                                else {
                                                    var index1 = $scope.TimeSheetReport.map(function (img) { return img.UserName }).indexOf(Reports[j].UserName);
                                                    if (index1 == 0) {
                                                        $scope.TimeSheetReport.push(Reports[j]);
                                                    }
                                                    else {
                                                        var index2 = $scope.TimeSheetReport.map(function (img) { return img.Comments }).indexOf(Reports[j].Comments);
                                                        if (index2 == 0) {
                                                            $scope.TimeSheetReport.push(Reports[j]);
                                                        }
                                                        else {
                                                            var index3 = $scope.TimeSheetReport.map(function (img) { return img.ProjectID }).indexOf(Reports[j].ProjectID);
                                                            if (index3 == 0) {
                                                                $scope.TimeSheetReport.push(Reports[j]);
                                                            }
                                                            else {

                                                                var index4 = $scope.TimeSheetReport.map(function (img) { return img.Month }).indexOf(Reports[j].Month);
                                                                if (index4 == 0) {
                                                                    $scope.TimeSheetReport.push(Reports[j]);
                                                                }
                                                                else {


                                                                    chkDate = Reports[j].Date.split("-");
                                                                    GetDate = parseInt(chkDate[0]);
                                                                    DayHours = Reports[j].Hours || 0;
                                                                    var sdf = $scope.TimeSheetReport[i][DateNumber[GetDate]];
                                                                    if ($scope.TimeSheetReport[i][DateNumber[GetDate]] == undefined) {

                                                                        OldHours = 0;
                                                                    }
                                                                    else {
                                                                        OldHours = $scope.TimeSheetReport[i][DateNumber[GetDate]] || 0;
                                                                    }
                                                                    TotHours = OldHours + DayHours
                                                                    $scope.TimeSheetReport[i][DateNumber[GetDate]] = TotHours;
                                                                }
                                                            }
                                                        }



                                                    }
                                                }
                                            }


                                        }
                                    }

                                }

                                if ($scope.TotalCount == $scope.CheckTotalcount) { $("div#divLoading").removeClass('show'); }
                            }

                        });
                    }
                }
            }
        }

        $scope.ProjectNameFilter = function (data) {
            

            $scope.FClinetName = data;
        };
        $scope.customProjectNameFilter = function (TimeSheetReports) {

            if ($scope.FClinetName == undefined) { return true }
            else {
                var mstream = $scope.showProjectNames1(TimeSheetReports.ProjectID);
                return (mstream.toLowerCase().indexOf($scope.FClinetName.toLowerCase()) !== -1);
            }
        };
        $scope.showProjectNames1 = function (id) {

            if ($scope.GetProjectDetails.length > 0) {
                var SelectStream1 = [];
                if (id) {
                    SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: id });
                }
                return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
            }
            else {

            }


        };
       
        $scope.showProjectNames = function (id) {

            if ($scope.GetProjectDetails.length > 0) {
                var SelectStream1 = [];
                if (id.ProjectID) {
                    SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: id.ProjectID });
                }
                return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
            }
            else {

            }


        };
        $http.get('/PMSConfig/TaskContent.json').success(function (data) {

            $scope.Phase = data.Phase;
            $scope.TaskType = data.TaskType;
            $scope.Item = data.Item;
            $scope.Type = data.Type;
        });
        $scope.getProjectID = function () {
            // document.getElementById("AddStartDate").value = "";
            // document.getElementById("AddEndDate").value = "";
            $scope.From = {};

            $scope.ShowGrid = false;
            $scope.ShowButton = false;
        }
        $scope.Export = function (data) {

            // var blob = new Blob([document.getElementById(data).innerHTML], {
            //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"

            // });

            // var date = new Date();
            // $scope.CurrentDate = $filter('date')(new Date(), 'dd/MM/yyyy');
            // var filename = "TimeSheetReport" + ".xls";
            // saveAs(blob, filename);
            ExportReport = [];
            for (i = 0; i < $scope.TimeSheetReport.length; i++) {
                obj = {};
                ProjectName = $scope.showProjectNameFilter($scope.TimeSheetReport[i].ProjectID);
                obj["Project Name"] = ProjectName;
                obj["Resource Name"] = $scope.TimeSheetReport[i].UserName;
                obj.Phases = $scope.TimeSheetReport[i].Phase;
                obj["Actual Task"] = $scope.TimeSheetReport[i].Task;
                obj.Comments = $scope.TimeSheetReport[i].Comments;
                obj["Task Catagory"] = $scope.TimeSheetReport[i].Items;
                obj["Task Type"] = $scope.TimeSheetReport[i].TaskType;
                obj.Item = $scope.TimeSheetReport[i].Items;
                obj.Month = $scope.TimeSheetReport[i].Month;
                Billable = $scope.TimeSheetReport[i].IsBillable;
                if (Billable == false) {
                    obj.Billable = 'No'
                }
                else {
                    obj.Billable = 'Yes'
                }
                obj["'1'"] = $scope.TimeSheetReport[i].One || "";
                obj["'2'"] = $scope.TimeSheetReport[i].Two || "";
                obj["'3'"] = $scope.TimeSheetReport[i].Three || "";
                obj["'4'"] = $scope.TimeSheetReport[i].Four || "";
                obj["'5'"] = $scope.TimeSheetReport[i].Five || "";
                obj["'6'"] = $scope.TimeSheetReport[i].Six || "";
                obj["'7'"] = $scope.TimeSheetReport[i].Seven || "";
                obj["'8'"] = $scope.TimeSheetReport[i].Eight || "";
                obj["'9'"] = $scope.TimeSheetReport[i].Nine || "";
                obj["'10'"] = $scope.TimeSheetReport[i].Ten || "";
                obj["'11'"] = $scope.TimeSheetReport[i].Eleven || "";
                obj["'12'"] = $scope.TimeSheetReport[i].Tweleve || "";
                obj["'13'"] = $scope.TimeSheetReport[i].Thirteen || "";
                obj["'14'"] = $scope.TimeSheetReport[i].Fourteen || "";
                obj["'15'"] = $scope.TimeSheetReport[i].Fifteen || "";
                obj["'16'"] = $scope.TimeSheetReport[i].Sixteen || "";
                obj["'17'"] = $scope.TimeSheetReport[i].Seventeen || "";
                obj["'18'"] = $scope.TimeSheetReport[i].Eighteen || "";
                obj["'19'"] = $scope.TimeSheetReport[i].Nineteen || "";
                obj["'20'"] = $scope.TimeSheetReport[i].Twenty || "";
                obj["'21'"] = $scope.TimeSheetReport[i].TwentyOne || "";
                obj["'22'"] = $scope.TimeSheetReport[i].TwentyTwo || "";
                obj["'23'"] = $scope.TimeSheetReport[i].TwentyThree || "";
                obj["'24'"] = $scope.TimeSheetReport[i].TwentyFour || "";
                obj["'25'"] = $scope.TimeSheetReport[i].TwentyFive || "";
                obj["'26'"] = $scope.TimeSheetReport[i].TwentySix || "";
                obj["'27'"] = $scope.TimeSheetReport[i].TwentySeven || "";
                obj["'28'"] = $scope.TimeSheetReport[i].TwentyEight || "";
                obj["'29'"] = $scope.TimeSheetReport[i].TwentyNine || "";
                obj["'30'"] = $scope.TimeSheetReport[i].Thirty || "";
                obj["'31'"] = $scope.TimeSheetReport[i].ThirtyOne || "";
                ExportReport.push(obj);

            }

            if ($scope.TimeSheetReport.length > 0)
                alasql('SELECT * INTO XLSX("TimeSheet Report.xlsx",{sheetid: "Report",headers:true}) FROM ?', [ExportReport]);
            else
                $notify.warning('Warning', 'No Data Found');
        }

        
     

        $scope.showProjectNameFilter = function (clientid) {
            if ($scope.GetProjectDetails.length > 0) {
                var SelectStream1 = [];
                if (clientid) {
                    SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: clientid });
                }
                return SelectStream1[0].ProjectName;
            }
            else {
            }
        };
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
        logincheck();


    }]);


