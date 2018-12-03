

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




//Excel Read Code from directive  
app.directive("customerfileread", [function () {
    return {
        scope: {
            opts: '='
        },
        link: function ($scope, $elm, $attrs) {
            $elm.on('change', function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function () {

                        var data = evt.target.result;
                        var workbook = XLSX.read(data, { type: 'binary' });
                        $scope.headerNames = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                        $scope.ExcelMasterdata = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                        $scope.opts = [];
                        $scope.headerNames.forEach(function (h) {
                            $scope.opts.push({ ExcelColumnName: h });
                        });
                        $scope.opts.data = $scope.ExcelMasterdata;
                        $elm.val(null);
                    });
                };
                try {
                    //for other  Browsers  NOTE:if browser not support for "readAsBinaryString" its take "readAsArrayBuffer"
                    reader.readAsBinaryString(changeEvent.target.files[0]);

                } catch (error) {
                    //for IE Browser by roy
                    reader.readAsArrayBuffer(changeEvent.target.files[0]);
                }

            });
        }
    }
}]);

app.controller('TaskDetails', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


        //Excel Import
        $scope.$watch("ExcelTrigger", function (ExcelMasterValue) {
            debugger

            if (ExcelMasterValue != undefined) {

                //varaible declaration
                $scope.ExcelMasterdata = [];
                $scope.TempMasterGridData = [];
                $scope.TempUpdateMasterGridDataset = [];
                $scope.TempUpdateChildGridDataset = [];

                // $scope.ExcelMasterdata = ExcelMasterdata.length;
                $scope.MainExcelMasterdata = ExcelMasterValue.data;//Master Excel Data
                var ExcelMasterdata = [];
                ExcelMasterdata = $scope.MainExcelMasterdata;
                if (ExcelMasterdata.length == 0) { $notify.warning('Warning', 'No data Found'); return; }
                var ColChk = ExcelColumnNameCheck(ExcelMasterValue);
                if (ColChk == false) { $notify.warning('Warning', 'Excel Column Names are Mismatched'); return; }
                else {
                    successCount = 0;
                    for (var i = 0; i < ExcelMasterdata.length; i++) {
                        ;

                        var obj = {};
                        var ProjectName = ExcelMasterdata[i].ProjectName;
                        var UniqueID = ExcelMasterdata[i].UniqueID;
                        var Name = ExcelMasterdata[i].Name;
                        var ResourceNames = ExcelMasterdata[i].Resource;
                        var Type = ExcelMasterdata[i].Type;
                        var IsBillable = ExcelMasterdata[i].IsBillable;
                        var IsCR = ExcelMasterdata[i].IsCR;
                        var Duration = ExcelMasterdata[i].Effort;

                        var ConfigurableItem = ExcelMasterdata[i].ConfigurableItem || "DBScript";

                        var Start = ExcelMasterdata[i].StartDate;//12=4/6513
                        if (Start != undefined) {
                            Start = Start.replace("/", "-").replace("/", "-");

                            Start = Start.split('-')[1] + "-" + Start.split('-')[0] + "-" + Start.split('-')[2];
                            ExcelMasterdata[i].StartDate = Start
                        }


                        var Finish = ExcelMasterdata[i].EndDate;
                        if (Finish != undefined) {
                            Finish = Finish.replace("/", "-").replace("/", "-");
                            Finish = Finish.split('-')[1] + "-" + Finish.split('-')[0] + "-" + Finish.split('-')[2];
                            ExcelMasterdata[i].EndDate = Finish;
                        }
                        var Predecessors = ExcelMasterdata[i].Predecessors;
                        var Phase = ExcelMasterdata[i].Phase;
                        // alert(Phase);
                        if (i == 0) {
                            var FacilityCheck = ExcelMasterdata[i].FacilityID;
                            if (FacilityCheck == undefined || FacilityCheck == "") {
                                alert("Work Sheet is Empty" + (i + 2));
                                return;
                            }
                        }
                        if (ProjectName == undefined || ProjectName == "" || UniqueID == undefined || UniqueID == ""
                            || Name == undefined || Name == "" || ResourceNames == undefined || ResourceNames == ""
                            || Type == undefined || Type == "" || IsBillable == undefined || IsBillable == "" ||
                            IsCR == undefined || IsCR == "" || Duration == undefined || Duration == "" || Start == undefined || Start == ""
                            || Finish == undefined || Finish == ""
                            || Phase == undefined || Phase == "" ||
                            ConfigurableItem == undefined || ConfigurableItem == "") {
                            alert("Work Sheet is Empty" + (i + 2));
                            return;
                        }
                        //Check Dropdown Values
                        var SelectTypeStreams = [];
                        SelectTypeStreams = $filter('filter')($scope.Type, { key: Type });
                        if (SelectTypeStreams.length == 0) { alert("Not Valid Type Check Work Sheet No " + (i + 2)); return; }

                        var SelectIsBIllStreams = [];
                        SelectIsBIllStreams = $filter('filter')($scope.IsBIllable, { key: IsBillable });
                        if (SelectIsBIllStreams.length == 0) { alert("Not Valid IsBillable Work Sheet No " + (i + 2)); return; }

                        var SelectIsCRStreams = [];
                        SelectIsCRStreams = $filter('filter')($scope.IsCR, { key: IsCR });
                        if (SelectIsCRStreams.length == 0) { alert("Not Valid IsCR Check Work Sheet No " + (i + 2)); return; }

                        var SelectPhaseStreams = [];
                        SelectPhaseStreams = $filter('filter')($scope.Phase, { key: Phase });
                        if (SelectPhaseStreams.length == 0) { alert("Not Valid Phase Check  Work Sheet No " + (i + 2)); return; }
                        //ConfigurableItem


                        var SelectConfigurableItem = [];
                        SelectConfigurableItem = $filter('filter')($scope.ConfigurableItemNames, { Name: ConfigurableItem });
                        if (SelectConfigurableItem.length == 0) { alert("Not Valid Configurable Item  Check  Work Sheet No " + (i + 2)); return; }

                        //ConfigurableItem


                        //Check Project Names
                        var SelectProjectDetailsStreams = [];
                        SelectProjectDetails = $filter('filter')($scope.GetNewProjectDetails, { ProjectName: ProjectName });
                        if (SelectProjectDetails.length == 0) { alert("Not Valid Project Name  Check  Work Sheet No " + (i + 2)); return; }

                        //Check Uploaded Project Name
                        var c = document.getElementById("ProjectIDDrop");
                        var ProjectId = c.options[c.selectedIndex].text;
                        if (ProjectId != ProjectName) { alert("Project Mismatched  Check  Work Sheet No " + (i + 2)); return; }

                        ///Check Resources Name
                        var SelectGetteamMemberDetailsForTaskStreams = [];
                        SelectGetteamMemberDetailsForTaskStreams = $filter('filter')($scope.GetteamMemberDetailsForTask, { TeamMemberUserID: ResourceNames });
                        if (SelectGetteamMemberDetailsForTaskStreams.length == 0) {
                            alert("Not Valid ResourceNames  Check  Work Sheet No " + (i + 2));
                            return;
                        }
                        //Check Access permission
                        if ($scope.FileUploadVisible == false) { alert("Access Denied to upload Task Worksheet for selected Project"); return; }

                        //Check input type field like uniqueid,duration
                        if (isNaN(UniqueID)) {
                            alert("UniqueID Format is mimatched  Check  Work Sheet No " + (i + 2));
                            return;
                        }
                        if (isNaN(Duration)) {
                            alert("Duration Format is mimatched  Check  Work Sheet No " + (i + 2));
                            return;
                        }
                        //Check uniqueid
                        var valueArr = ExcelMasterdata.map(function (item) { return item.UniqueID });
                        var isDuplicate = valueArr.some(function (item, idx) {
                            return valueArr.indexOf(item) != idx
                        });
                        if (isDuplicate == true) { alert("UniqueID Format is mismatched  Check  Work Sheet"); return; }

                        var c = document.getElementById("ProjectIDDrop");
                        var ProjectId = c.options[c.selectedIndex].text;
                        var SelectProjectDetailsStreams = [];
                        SelectProjectDetailsStreams = $filter('filter')($scope.GetNewProjectDetails, { ProjectName: ProjectId });
                        var PjstartDate = SelectProjectDetailsStreams[0].StartDate;
                        var PjEndtDate = SelectProjectDetailsStreams[0].EndDate;


                        //date validation
                        var date2 = DateCalculation(Finish);
                        var date1 = DateCalculation(Start);
                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        diffDays++;
                        if (diffDays == 0) { diffDays = 1 }
                        var DurationDays = Duration / 8;
                        var deviahours = diffDays * 8;

                        if (DurationDays > deviahours) {
                            alert(" Duration of task cant fit between task start and end date in row No " + (i + 2));
                            return;
                        }
                        if (DurationDays > diffDays) {
                            alert(" Duration of task cant fit between task start and end date in row No " + (i + 2));
                            return;
                        }


                        $scope.Start = Start;
                        // PjstartDate =   $scope.Start;
                        var excelstartdate = Start;

                        $scope.Finish = Finish;
                        var excelenddate = $scope.Finish;
                        var startDate = excelstartdate.split("-");
                        var endDate = excelenddate.split("-");


                        var ProjstartDateChk = new Date(startDate[1] + "-" + startDate[0] + "-" + startDate[2]);
                        var EndDateChk = new Date(endDate[1] + "-" + endDate[0] + "-" + endDate[2]);

                        if (ProjstartDateChk > EndDateChk) {
                            alert('Task Start Date is Greater than  End Date in row No ' + (i + 2));

                            return;
                        }




                        //start date validation
                        var ProjStartDate = PjstartDate;
                        var ProjEndday = parseInt(ProjStartDate.substring(0, 2));
                        var ProjEndmonth = parseInt(ProjStartDate.substring(3, 5));
                        var ProjEndyear = parseInt(ProjStartDate.substring(6, 10));

                        var Endday = parseInt(excelstartdate.substring(0, 2));
                        var Endmonth = parseInt(excelstartdate.substring(3, 5));
                        var Endyear = parseInt(excelstartdate.substring(6, 10));


                        var ProjstartDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                        var startDateChk = new Date(Endyear, Endmonth, Endday);

                        if (ProjstartDateChk > startDateChk) {
                            alert(" Task start date is greater than Project Start Date in row No " + (i + 2));
                            $scope.disableds = true;
                            return;
                        }

                        //End date validation


                        var ProjEndDate = PjEndtDate;
                        var ProjEndday = parseInt(ProjEndDate.substring(0, 2));
                        var ProjEndmonth = parseInt(ProjEndDate.substring(3, 5));
                        var ProjEndyear = parseInt(ProjEndDate.substring(6, 10));

                        var Endday = parseInt(excelenddate.substring(0, 2));
                        var Endmonth = parseInt(excelenddate.substring(3, 5));
                        var Endyear = parseInt(excelenddate.substring(6, 10));


                        var ProjEndDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                        var EndDateChk = new Date(Endyear, Endmonth, Endday);

                        if (ProjEndDateChk < EndDateChk) {
                            alert(" Task End date is greater than Project End Date in row No " + (i + 2));
                            return;
                        }
                    }
                    $http.get('/GetTaskBasedFacilityDetails/' + FacilityService).then(function (response) {
                        $scope.GetTaskBasedFacilityDetails = response.data;

                        $scope.TaskData = [];
                        $scope.AlreadyExistsTaskData = [];
                        var ProjectID = '';
                        for (var i = 0; i < ExcelMasterdata.length; i++) {

                            var obj = {};
                            var ProjectName = ExcelMasterdata[i].ProjectName;
                            var UniqueID = ExcelMasterdata[i].UniqueID;
                            var Name = ExcelMasterdata[i].Name;
                            var ResourceNames = ExcelMasterdata[i].Resource;
                            var Type = ExcelMasterdata[i].Type;
                            var IsBillable = ExcelMasterdata[i].IsBillable;
                            var IsCR = ExcelMasterdata[i].IsCR;
                            var Duration = ExcelMasterdata[i].Effort;
                            var Start = ExcelMasterdata[i].StartDate;
                            var Finish = ExcelMasterdata[i].EndDate;
                            var Predecessors = ExcelMasterdata[i].Predecessors;
                            var Phase = ExcelMasterdata[i].Phase;
                            var c = document.getElementById("ProjectIDDrop");
                            var AddProjectId = c.options[c.selectedIndex].value;
                            ProjectID = AddProjectId;

                            var SelectTaskDetailsStreams = [];
                            SelectTaskDetailsStreams = $filter('filter')($scope.GetTaskBasedFacilityDetails, { ProjectID: AddProjectId, UniqueID: UniqueID, FacilityID: FacilityService });
                            if (SelectTaskDetailsStreams.length == 0) {
                                obj.TaskDescription = Name;
                                obj.PlanStartDate = Start;
                                obj.Duration = Duration;
                                obj.PlanEndDate = Finish;
                                obj.ActualEndDate = null;
                                obj.ActualDuration = null;
                                var c = document.getElementById("ProjectIDDrop");
                                var AddProjectId = c.options[c.selectedIndex].value;
                                obj.ProjectID = AddProjectId;
                                obj.TaskCategoryName = Phase;
                                obj.TaskStatusName = "Queue";
                                obj.TaskPriorityName = "High";
                                obj.TeamLeaderUserID = username;
                                obj.isMailSend = 1;
                                obj.ResourceComments = null;
                                obj.TeamMemberUserID = ResourceNames;
                                obj.IsVisible = 1;
                                obj.UniqueID = UniqueID;
                                obj.TypeNew = Type;
                                obj.IsBillable = IsBillable;
                                obj.IsCR = IsCR;
                                obj.Predecessors = Predecessors;
                                obj.CreateById = username;
                                obj.CreateOn = $filter('date')(new Date(), 'dd-MM-yyyy');
                                obj.UpdateById = username;
                                obj.FacilityID = FacilityService;
                                if (obj.isMailSend == 1) {

                                    $http.get('/GetUserEmailID/' + ResourceNames).then(function (response) {
                                        $scope.GetUserEmail = response.data;
                                        var sendemail = $scope.GetUserEmail[0].Email;

                                        // $http.post('/ProjectAllotNotification', {
                                        //     "TeamLeaderID": ResourceNames,
                                        //     "ProjectNameInfo": ProjectName,
                                        //     "email": sendemail
                                        // }).then(function (response) {


                                        // });
                                    });
                                }
                                $scope.TaskData.push(obj);
                            }
                            else {
                                obj.id = SelectTaskDetailsStreams[0]._id;
                                obj.TaskDescription = Name;
                                obj.PlanStartDate = Start;
                                obj.Duration = Duration;
                                obj.PlanEndDate = Finish;
                                var c = document.getElementById("ProjectIDDrop");
                                var AddProjectId = c.options[c.selectedIndex].value;
                                obj.ProjectID = AddProjectId;
                                obj.TaskCategoryName = Phase;
                                obj.TeamLeaderUserID = username;
                                obj.TeamMemberUserID = ResourceNames;
                                obj.UniqueID = UniqueID;
                                obj.TypeNew = Type;
                                obj.IsBillable = IsBillable;
                                obj.IsCR = IsCR;
                                obj.Predecessors = Predecessors;
                                obj.CreateById = username;
                                obj.CreateOn = $filter('date')(new Date(), 'dd-MM-yyyy');
                                obj.UpdateById = username;
                                obj.FacilityID = FacilityService;
                                $scope.AlreadyExistsTaskData.push(obj);
                            }

                        }
                        //Update AlreadyExists Record
                        if ($scope.AlreadyExistsTaskData.length != 0) {
                            debugger;
                            for (i = 0; i < $scope.AlreadyExistsTaskData.length; i++) {
                                debugger
                                var id = $scope.AlreadyExistsTaskData[i].id || "";
                                var TaskDescription = $scope.AlreadyExistsTaskData[i].TaskDescription;
                                var PlanStartDate = $scope.AlreadyExistsTaskData[i].PlanStartDate;
                                var Duration = $scope.AlreadyExistsTaskData[i].Duration;
                                var PlanEndDate = $scope.AlreadyExistsTaskData[i].PlanEndDate;
                                var ProjectID = $scope.AlreadyExistsTaskData[i].ProjectID;
                                var TaskCategoryName = $scope.AlreadyExistsTaskData[i].TaskCategoryName;
                                var TeamLeaderUserID = $scope.AlreadyExistsTaskData[i].TeamLeaderUserID;
                                var TeamMemberUserID = $scope.AlreadyExistsTaskData[i].TeamMemberUserID;
                                var UniqueID = $scope.AlreadyExistsTaskData[i].UniqueID;
                                var TypeNew = $scope.AlreadyExistsTaskData[i].TypeNew;
                                var IsBillable = $scope.AlreadyExistsTaskData[i].IsBillable;
                                var Predecessors = $scope.AlreadyExistsTaskData[i].Predecessors;
                                if (Predecessors == undefined || Predecessors == '') {
                                    Predecessors = 'empty';
                                }
                                var IsCR = $scope.AlreadyExistsTaskData[i].IsCR;
                                var CreateById = $scope.AlreadyExistsTaskData[i].CreateById;
                                var CreateOn = $scope.AlreadyExistsTaskData[i].CreateOn;
                                var UpdateById = $scope.AlreadyExistsTaskData[i].UpdateById
                                var FacilityID = $scope.AlreadyExistsTaskData[i].FacilityID;

                                $http.put('/UpdateManageTaskDetails', {
                                    'id': id,
                                    'TaskDescription': TaskDescription,
                                    'PlanStartDate': PlanStartDate,
                                    'Duration': Duration,
                                    'PlanEndDate': PlanEndDate,
                                    'ProjectID': ProjectID,
                                    'TaskCategoryName': TaskCategoryName,
                                    'TeamLeaderUserID': TeamLeaderUserID,
                                    'TeamMemberUserID': TeamMemberUserID,
                                    'UniqueID': UniqueID,
                                    'TypeNew': TypeNew,
                                    'IsBillable': IsBillable,
                                    'Predecessors': Predecessors,
                                    'IsCR': IsCR,
                                    'CreateById': CreateById,
                                    'CreateOn': CreateOn,
                                    'UpdateById': UpdateById,
                                    'FacilityID': FacilityID
                                }).then(function (response) {
                                    $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                                        $scope.GetTaskGridValues = response.data;
                                        $notify.success('success', 'Task Uploaded successfully');
                                    });

                                });
                            }

                        }
                        if ($scope.TaskData.length != 0) {

                            // $http.post('/AddTaskBasedFacility', $scope.TaskData).then(function (response) {
                            //     $notify.success('success', 'Task Uploaded successfully');
                            //     $http.get('/Manage_Usershow').then(function (response) {

                            //         $scope.Manage_Users = response.data;
                            //         $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                            //             $scope.GetTaskGridValues = response.data;

                            //         });
                            //     });
                            // });
                            for (i = 0; i < $scope.TaskData.length; i++) {
                                debugger
                                debugger
                                var id = $scope.TaskData[i].id || "";
                                var TaskDescription = $scope.TaskData[i].TaskDescription;
                                var PlanStartDate = $scope.TaskData[i].PlanStartDate;
                                var Duration = $scope.TaskData[i].Duration;
                                var PlanEndDate = $scope.TaskData[i].PlanEndDate;
                                var ProjectID = $scope.TaskData[i].ProjectID;
                                var TaskCategoryName = $scope.TaskData[i].TaskCategoryName;
                                var TeamLeaderUserID = $scope.TaskData[i].TeamLeaderUserID;
                                var TeamMemberUserID = $scope.TaskData[i].TeamMemberUserID;
                                var UniqueID = $scope.TaskData[i].UniqueID;
                                var TypeNew = $scope.TaskData[i].TypeNew;
                                var IsBillable = $scope.TaskData[i].IsBillable;
                                var Predecessors = $scope.TaskData[i].Predecessors;
                                if (Predecessors == undefined || Predecessors == '') {
                                    Predecessors = 'empty';
                                }
                                var IsCR = $scope.TaskData[i].IsCR;
                                var CreateById = $scope.TaskData[i].CreateById;
                                var CreateOn = $scope.TaskData[i].CreateOn;
                                var UpdateById = $scope.TaskData[i].UpdateById
                                var FacilityID = $scope.TaskData[i].FacilityID;

                                $http.put('/UpdateManageTaskDetails', {
                                    'id': id,
                                    'TaskDescription': TaskDescription,
                                    'PlanStartDate': PlanStartDate,
                                    'Duration': Duration,
                                    'PlanEndDate': PlanEndDate,
                                    'ProjectID': ProjectID,
                                    'TaskCategoryName': TaskCategoryName,
                                    'TeamLeaderUserID': TeamLeaderUserID,
                                    'TeamMemberUserID': TeamMemberUserID,
                                    'UniqueID': UniqueID,
                                    'TypeNew': TypeNew,
                                    'IsBillable': IsBillable,
                                    'Predecessors': Predecessors,
                                    'IsCR': IsCR,
                                    'CreateById': CreateById,
                                    'CreateOn': CreateOn,
                                    'UpdateById': UpdateById,
                                    'FacilityID': FacilityID
                                }).then(function (response) {
                                    $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                                        $scope.GetTaskGridValues = response.data;
                                        $notify.success('success', 'Task Uploaded successfully');
                                    });

                                });
                            }
                        }
                    });
                }
                //insert Master Grid values start



                //Excel code End

            }


        });


        function ExcelColumnNameCheck(ExcelMasterValue) {



            var ColumnNames = [
                { ExcelColumnName: "ProjectName" }, { ExcelColumnName: "UniqueID" }, { ExcelColumnName: "Name" }, { ExcelColumnName: "Resource" },
                { ExcelColumnName: "Type" }, { ExcelColumnName: "ConfigurableItem" }, { ExcelColumnName: "IsBillable" },
                { ExcelColumnName: "IsCR" }, { ExcelColumnName: "Effort" }, { ExcelColumnName: "StartDate" }, { ExcelColumnName: "FacilityID" },
                { ExcelColumnName: "EndDate" }, { ExcelColumnName: "Predecessors" }, { ExcelColumnName: "Phase" }
            ]

            if (ExcelMasterValue.length > 0) {
                for (i = 0; ExcelMasterValue.length > i; i++) {
                    if (i <= 13) {//23 refer column Count
                        var sf = ExcelMasterValue[i].ExcelColumnName
                        var Filter = ColumnNames.filter(function (ele) {
                            return ele.ExcelColumnName == ExcelMasterValue[i].ExcelColumnName;
                        });
                        if (Filter.length == 0) {
                            return false;
                        }

                    }
                }
            } else {
                return false;
            }
        }


        //Facility DropDown Change Event

        $scope.$watch('value.storedObject', function (newVal) {
            // debugger;
            $scope.GetTaskGridValues = "";
            $scope.GetteamleaderDetails = "";
            $scope.DurationWithNames = "";
            //$scope.HideSummaryRow=true;
            $scope.GetProjectDetail = {};
            $scope.TotalActualCost = "";
            $scope.TotalBudget = "";
            $scope.TotalActualHour = "";
            $scope.TotalPlannedVsActuals = "";
            $scope.TotalEffort = "";
            if (newVal !== '') {
                //$scope.HideSummaryRow=true;
                FacilityService = newVal;
                $scope.FileUploadVisible = false;
                refresh();
                getprojdetails();
                $http.get('/GetProjectNamesfortask/' + FacilityService).then(function (response) {
                    $scope.GetNewProjectDetails = response.data;
                });

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
                    var access = $scope.role[0].UIList[8].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }

        $http.get('/UserResource123/' + FacilityService).then(function (response) {

            $scope.GetUserNames = response.data;


        });
        $scope.customProjectNameFilter = function (GetTaskGridValue) {

            if ($scope.FProjectName == undefined) { return true }
            else {
                var mstream = $scope.showProjectName(GetTaskGridValue.ProjectName);
                return (mstream.toLowerCase().indexOf($scope.FProjectName.toLowerCase()) !== -1);
            }
        };

        $scope.ProjectNameFilter = function (data) {

            $scope.FProjectName = data;
        };
        refreshsUpdate();
        $http.get('/GetProjectNamesfortask/' + FacilityService).then(function (response) {
            $scope.GetNewProjectDetails = response.data;
        });
        var refresh = function () {
            //
            //  debugger;
            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
                $scope.HideSummaryRow = false;
            }

            else {

                $scope.ShowBody = true;
                $scope.Showmessage = false;
                //  $scope.HideSummaryRow=true;
                $http.get('/ViewFacility').then(function (response) {
                    $scope.ViewFacilitys = response.data;

                    $http.get('/GetResourceSalary/' + FacilityService).then(function (response) {
                        $scope.GetResourceCost = response.data;
                    });
                    $http.get('/GetResourceLoadedCostFromExpense/' + FacilityService).then(function (response) {
                        $scope.GetResourceLoadedCostFromExpense = response.data;
                    });
                    $http.get('/PMSConfig/TaskContent.json').then(function (response) {
                        $scope.DividedBy = response.data.DividedBY.divideBY;
                    });


                    $http.get('/ConfigureItems_Show/' + FacilityService).then(function (response) {
                        $scope.ConfigurableItemNames = response.data;

                    });



                });


            }
        }


        $scope.getProjName = function () {
            ;
            $http.get('/Getteamdetails/' + FacilityService).then(function (response) {
                $scope.Getteamdetails = response.data;
                getResourceName();
            });
        }
        var MainTabText = '';
        $scope.Grid1visile = true;
        $scope.ExcelUploadTasks = function (Grid1) {
            ;
            $scope.addbuttonfalse = true;
            $scope.Grid1visile = true;
            $scope.Grid2visile = false;
            $scope.Grid3visile = false;
            $scope.Grid4visile = false;
            MainTabText = Grid1;

            if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                $scope.FileUploadVisible = true;
                return;
            } else { if (MainTabText != "Grid2") { $scope.FileUploadVisible = false; } }
            if ($scope.GetteamMemberDetailsForTask.length == 0) {
                $notify.warning('warning', "No Members are allocated for selected Project");
                $scope.FileUploadVisible = false;
                return;
            } else { if (MainTabText != "Grid2") { $scope.FileUploadVisible = false; } }
        }

        $scope.addbuttonfalse = true;
        $scope.ExcelUpdatePhaseEndDate = function (Grid2) {
            ;
            $scope.addbuttonfalse = false;
            $scope.Grid1visile = false;
            $scope.Grid3visile = false;
            $scope.Grid4visile = false;
            $scope.Grid2visile = true;
            $scope.FileUploadVisible = false;
            MainTabText = Grid2;
            $scope.Hideaddbutton = false;

        }





        $scope.send = function () {

            for (i = 0; i < $scope.GetTaskGridValues.length; i++) {
                var aendate = $scope.GetTaskGridValues[i].ActualEndDate;

            }
        }


        var getSelectedProj = "";
        var getrefreshdata = function (ProjectID) {

            GridProjectID = ProjectID;
            getSelectedProj = ProjectID;
            if (ProjectID != undefined) {
                $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                    $scope.GetTaskGridValues = response.data;


                    $http.get('/Getteamleader/' + ProjectID).then(function (response) {
                        $scope.GetteamleaderDetails = response.data;
                        if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                            $scope.FileUploadVisible = true;
                        } else { if (MainTabText != "Grid2") { $scope.FileUploadVisible = false; } }

                        $http.get('/GetteamMemberDetailsForTask/' + ProjectID).then(function (response) {
                            $scope.GetteamMemberDetailsForTask = response.data;
                            if ($scope.GetteamMemberDetailsForTask.length == 0) {
                                $notify.warning('warning', "No Members are allocated for selected Project");
                                $scope.FileUploadVisible = false;
                                return;
                            } else { if (MainTabText != "Grid2") { $scope.FileUploadVisible = true; } }
                        });
                    });
                });
            }
            else {
                $scope.FileUploadVisible = false;
            }

        }


        //radio button filter by row cost and loaded cost:

        $scope.BindRawCost = function () {
            var FilterByRowCost = document.getElementById('radio1').value;
            // alert(FilterByRowCost);
            var c = document.getElementById("ProjectIDDrop");
            var ProjectID = c.options[c.selectedIndex].value;
            if (FilterByRowCost == "Raw Cost") {
                funProjectNameChange(ProjectID);
            }
            else {
                $notify.warning("warning", "No Data to show raw Cost");
            }
        }

        $scope.BindLoadedCost = function () {
            var FilterByLoadedCost = document.getElementById('radio2').value;
            //  alert(FilterByLoadedCost);


            if (FilterByLoadedCost == "Loaded Cost") {
                var c = document.getElementById("ProjectIDDrop");
                var ProjectID = c.options[c.selectedIndex].value;
                BindLoadedCostValues(ProjectID);
            }
            else {
                $notify.warning("warning", "No Data to show Loaded Cost");
            }
        }
        //end



        var slctdProjectid = '';
        $scope.ViewTask = function (Grid3) {
            // debugger;
            $scope.addbuttonfalse = false;
            $scope.DurationWithNames = '';
            $scope.Grid1visile = false;
            $scope.Grid2visile = false;
            $scope.Grid3visile = false;
            $scope.Grid4visile = false;


            var radio1 = document.getElementById('radio1').checked;
            var radio2 = document.getElementById('radio2').checked;
            // var c = document.getElementById("ProjectIDDrop");
            // var ProjectID = c.options[c.selectedIndex].value;
            //if(ProjectID!="")
            // {
            if (radio1 == "true") {
                $scope.Grid3visile = true;
                $scope.FileUploadVisible = false;
                MainTabText = Grid3;
                $scope.Hideaddbutton = false;

                var c = document.getElementById("ProjectIDDrop");
                var ProjectID = c.options[c.selectedIndex].value;
                funProjectNameChange(ProjectID);
            }
            else {
                $scope.Grid3visile = false;
                $scope.Grid4visile = true;

                $scope.FileUploadVisible = false;
                MainTabText = Grid3;
                $scope.Hideaddbutton = false;

                var c = document.getElementById("ProjectIDDrop");
                var ProjectID = c.options[c.selectedIndex].value;
                BindLoadedCostValues(ProjectID);
                //  }
            }
            // else{
            //  $notify.warning("warning","Please Select the Project");
            // }


        }

        //Project Name Dropdown Change
        var GridProjectID = '';
        //FileUploadVisible


        $scope.ProjectNameChange = function (ProjectID) {
            // debugger;
            var r1 = document.getElementById('radio1').checked;
            //   alert(FilterByRowCost)
            var r2 = document.getElementById('radio2').checked;
            // alert(FilterByLoadedCost);
            //  var c = document.getElementById("ProjectIDDrop");
            //  var ProjectID = c.options[c.selectedIndex].value;
            if (r2 == true) {

                BindLoadedCostValues(ProjectID);
            }
            else {


                funProjectNameChange(ProjectID);

            }

            //  funProjectNameChange(ProjectID);

        }
        var BindLoadedCostValues = function (ProjectID) {
            if (ProjectID == undefined) {
                $scope.GetTaskGridValues = "";
            }

            GridProjectID = ProjectID;

            if (ProjectID != undefined) {

                $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                    $scope.GetTaskGridValues = response.data;
                    $http.get('/GetResourceLoadedCostFromExpense/' + FacilityService).then(function (response) {
                        $scope.GetResourceLoadedCostFromExpense = response.data;
                        //  console.log( $scope.GetResourceLoadedCostFromExpense);
                        //GetResourceLoadedCostFromExpense

                        /////////////// to get hours from team lead time sheet table
                        $http.get('/GetActualHoursFromTeamLeadTimesheet/' + ProjectID + '/' + FacilityService).then(function (response) {
                            $scope.ActualHoursAndCost = response.data;
                            $http.get('/PMSConfig/TaskContent.json').then(function (response) {
                                $scope.DividedBy = response.data.DividedBY.divideBY;
                            });


                            var arr = [];
                            var Calculatehours = [];
                            var slctdProjectid = ProjectID;
                            ///Get Month Interval based selected project
                            for (m = 0; m < $scope.GetProjectDetails.length; m++) {
                                $scope.PrjctID = $scope.GetProjectDetails[m]._id;
                                if ($scope.PrjctID == slctdProjectid) {
                                    $scope.PrjctName = $scope.GetProjectDetails[m].ProjectName;
                                    $scope.psdate = $scope.GetProjectDetails[m].StartDate;
                                    $scope.pedate = $scope.GetProjectDetails[m].EndDate;
                                    var sdate = DateCalculation($scope.psdate);
                                    var edate = DateCalculation($scope.pedate);
                                    var psmonthName = sdate.getMonth() + 1;
                                    var pemonthName = edate.getMonth() + 1;
                                    var psyear = sdate.getFullYear();
                                    var peyear = edate.getFullYear();
                                    var monthNames = ["January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"];
                                    $scope.strtMnthname = monthNames[psmonthName - 1];
                                    $scope.EndMnthname = monthNames[pemonthName - 1];
                                    for (var i = psmonthName - 1; i < pemonthName; i++) {
                                        var aResult = monthNames[i % 12] + " " + Math.floor(psyear + (i / 12));
                                        arr.push(aResult);
                                    }
                                }
                            }
                            ///Get Month Interval based selected project End
                            $scope.Hval = 0;
                            $scope.DurationWithDetails = [];

                            for (i = 0; i < $scope.GetTaskGridValues.length; i++) {
                                var DurationSumvalue = 0;
                                $scope.resourcename = $scope.GetTaskGridValues[i].TeamMemberUserID;
                                DurationSumvalue = (DurationSumvalue + parseFloat($scope.GetTaskGridValues[i].Duration));
                                var obj = {};
                                obj.Name = $scope.resourcename;
                                obj.Duration = DurationSumvalue;
                                //get amount from expense UI(pms cost table) start
                                var SelectResourceID = [];
                                $scope.resourceLoadCost = 0;
                                obj.PerHourCostValue = 0;

                                for (k = 0; k < arr.length; k++) {
                                    var monthSplitVal = arr[k].split(' ');
                                    SelectResourceID = $filter('filter')($scope.GetResourceLoadedCostFromExpense, { UserName: $scope.resourcename, Month: monthSplitVal[0] });
                                    for (l = 0; l < SelectResourceID.length; l++) {

                                        $scope.resourceLoadCost = ($scope.resourceLoadCost + parseFloat(SelectResourceID[l].LoadedCostValue) || 0);
                                    }
                                }
                                //get amount from expense UI(pms cost table) end

                                var actlHourVal = 0;
                                ////// Push all per hour cost and planned budget into array
                                // obj.PerHourCostValue = $scope.resourceAmount / $scope.DividedBy;
                                obj.PerHourCostValue = ($scope.resourceLoadCost / $scope.DividedBy).toFixed(2);
                                obj.PlannedBudget = DurationSumvalue * obj.PerHourCostValue;  // planned budget is the total cost
                                $scope.DurationWithDetails.push(obj);
                            }




                            //////////////////////  get distinct resource,  perhour cost, duration,planned budget 
                            var ref = {};
                            var res = $scope.DurationWithDetails.reduce(function (arr, o) {
                                if (!(o.Name in ref)) {
                                    ref[o.Name] = arr.length;
                                    arr.push($.extend({}, o));

                                } else {
                                    arr[ref[o.Name]].Duration += o.Duration;
                                    arr[ref[o.Name]].PerHourCostValue + o.PerHourCostValue;
                                    arr[ref[o.Name]].PlannedBudget += o.PlannedBudget;
                                }
                                return arr;
                            }, []);

                            //bind Loaded Cost Datas: resource,per hour cost,duration, planned budget
                            $scope.DurationWithNames = res;

                            //////////////////////get distinct resource hours from team lead timesheet 
                            var Hourref = {};
                            var res1 = $scope.ActualHoursAndCost.reduce(function (Calculatehours, o) {
                                if (!(o.UserName in Hourref)) {
                                    Hourref[o.UserName] = Calculatehours.length;
                                    Calculatehours.push($.extend({}, o));

                                } else {
                                    Calculatehours[Hourref[o.UserName]].Hours += o.Hours;

                                }
                                return Calculatehours;
                            }, []);

                            $scope.DurationWithNamesMain = res1;

                            ////////////////////////////////// bind actual hour,actual cost,PlannedVsActual value
                            var obj = {}
                            // for (p = 0; p < $scope.DurationWithNamesMain.length; p++) {
                            //     debugger;
                            //     $scope.DurationWithNames[p].Name = $scope.DurationWithNamesMain[p].UserName;
                            //     actlHourVal = $scope.DurationWithNamesMain[p].Hours;
                            //     $scope.DurationWithNames[p].ActualHour = actlHourVal / 60;
                            //     $scope.DurationWithNames[p].ActualCost = $scope.DurationWithNames[p].PerHourCostValue * $scope.DurationWithNames[p].ActualHour;
                            //     $scope.DurationWithNames[p].PlannedVsActual = $scope.DurationWithNames[p].PlannedBudget - $scope.DurationWithNames[p].ActualCost;
                            // }
                            // console.log($scope.DurationWithNames);
                            for (p = 0; p < $scope.DurationWithNames.length; p++) {
                                //  debugger;
                                if ($scope.DurationWithNamesMain[p] != undefined) {
                                    //$scope.DurationWithNames[p].Name = $scope.DurationWithNamesMain[p].UserName;  //check this 
                                    // alert($scope.DurationWithNames[p].Name);
                                    $scope.DurationWithNames[p].Name = $scope.DurationWithNames[p].Name;
                                    actlHourVal = $scope.DurationWithNamesMain[p].Hours;
                                    $scope.DurationWithNames[p].ActualHour = actlHourVal / 60;

                                    $scope.DurationWithNames[p].ActualCost = ($scope.DurationWithNames[p].PerHourCostValue * $scope.DurationWithNames[p].ActualHour).toFixed(2);
                                    $scope.DurationWithNames[p].PlannedVsActual = ($scope.DurationWithNames[p].PlannedBudget - $scope.DurationWithNames[p].ActualCost).toFixed(2);

                                }
                                else {
                                    $scope.DurationWithNames[p].ActualHour = 0;
                                    $scope.DurationWithNames[p].ActualCost = 0;
                                    $scope.DurationWithNames[p].PlannedVsActual = 0;
                                }
                            }

                            //get overall summary of Actual hour cost, plannedvsactual start
                            $scope.TotalEffort = 0;
                            $scope.TotalBudget = 0;
                            $scope.TotalActualHour = 0;
                            $scope.TotalActualCost = 0;
                            $scope.TotalPlannedVsActuals = 0;
                            console.log($scope.DurationWithNames);
                            for (s = 0; s < $scope.DurationWithNames.length; s++) {
                                //    debugger;

                                $scope.TotalEffort = $scope.TotalEffort + $scope.DurationWithNames[s].Duration;
                                $scope.TotalBudget = $scope.TotalBudget + $scope.DurationWithNames[s].PlannedBudget;
                                $scope.TotalActualHour = $scope.TotalActualHour + $scope.DurationWithNames[s].ActualHour;
                                $scope.TotalActualCost = $scope.TotalActualCost + parseFloat($scope.DurationWithNames[s].ActualCost);
                                $scope.TotalPlannedVsActuals = ($scope.TotalBudget - $scope.TotalActualCost).toFixed(2);
                            }

                            //get overall summary of Actual hour cost, plannedvsactual end


                            $http.get('/Getteamleader/' + ProjectID).then(function (response) {
                                $scope.GetteamleaderDetails = response.data;
                                if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                                    $scope.FileUploadVisible = true;
                                } else {
                                    if (MainTabText != "Grid2") { $scope.FileUploadVisible = false; }
                                    if (MainTabText == "Grid3") {
                                        $scope.FileUploadVisible = false;
                                    }

                                }
                                $http.get('/GetteamMemberDetailsForTask/' + ProjectID).then(function (response) {
                                    $scope.GetteamMemberDetailsForTask = response.data;
                                    if ($scope.GetteamMemberDetailsForTask.length == 0) {
                                        $notify.warning('warning', "No Members are allocated for selected Project");
                                        $scope.FileUploadVisible = false;
                                        return;
                                    } else {
                                        if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                                            $scope.FileUploadVisible = true;
                                        }
                                        if (MainTabText == "Grid3") { $scope.FileUploadVisible = false; }
                                    }
                                });

                            });
                        });
                    });

                });

            }
            else {
                $scope.FileUploadVisible = false;
            }
        }


        var funProjectNameChange = function (ProjectID) {
            if (ProjectID == undefined) {
                $scope.GetTaskGridValues = "";
            }

            GridProjectID = ProjectID;

            if (ProjectID != undefined) {

                $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                    $scope.GetTaskGridValues = response.data;
                    $http.get('/GetResourceSalary/' + FacilityService).then(function (response) {
                        $scope.GetResourceCost = response.data;

                        /////////////// to get hours from team lead time sheet table
                        $http.get('/GetActualHoursFromTeamLeadTimesheet/' + ProjectID + '/' + FacilityService).then(function (response) {
                            $scope.ActualHoursAndCost = response.data;
                            $http.get('/PMSConfig/TaskContent.json').then(function (response) {
                                $scope.DividedBy = response.data.DividedBY.divideBY;
                            });


                            var arr = [];
                            var Calculatehours = [];
                            var slctdProjectid = ProjectID;
                            ///Get Month Interval based selected project
                            for (m = 0; m < $scope.GetProjectDetails.length; m++) {
                                $scope.PrjctID = $scope.GetProjectDetails[m]._id;
                                if ($scope.PrjctID == slctdProjectid) {
                                    $scope.PrjctName = $scope.GetProjectDetails[m].ProjectName;
                                    $scope.psdate = $scope.GetProjectDetails[m].StartDate;
                                    $scope.pedate = $scope.GetProjectDetails[m].EndDate;
                                    var sdate = DateCalculation($scope.psdate);
                                    var edate = DateCalculation($scope.pedate);
                                    var psmonthName = sdate.getMonth() + 1;
                                    var pemonthName = edate.getMonth() + 1;
                                    var psyear = sdate.getFullYear();
                                    var peyear = edate.getFullYear();
                                    var monthNames = ["January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"];
                                    $scope.strtMnthname = monthNames[psmonthName - 1];
                                    $scope.EndMnthname = monthNames[pemonthName - 1];
                                    for (var i = psmonthName - 1; i < pemonthName; i++) {
                                        var aResult = monthNames[i % 12] + " " + Math.floor(psyear + (i / 12));
                                        arr.push(aResult);
                                    }
                                }
                            }
                            ///Get Month Interval based selected project End
                            $scope.Hval = 0;
                            $scope.DurationWithDetails = [];

                            for (i = 0; i < $scope.GetTaskGridValues.length; i++) {
                                var DurationSumvalue = 0;
                                $scope.resourcename = $scope.GetTaskGridValues[i].TeamMemberUserID;
                                DurationSumvalue = (DurationSumvalue + parseFloat($scope.GetTaskGridValues[i].Duration));
                                var obj = {};
                                obj.Name = $scope.resourcename;
                                obj.Duration = DurationSumvalue;
                                //get amount from expense UI(pms cost table) start
                                var SelectResourceID = [];
                                $scope.resourceAmount = 0;
                                obj.PerHourCostValue = 0;

                                for (k = 0; k < arr.length; k++) {
                                    var monthSplitVal = arr[k].split(' ');
                                    SelectResourceID = $filter('filter')($scope.GetResourceCost, { UserName: $scope.resourcename, Month: monthSplitVal[0] });
                                    for (l = 0; l < SelectResourceID.length; l++) {
                                        //  $scope.resourceAmount = $scope.resourceAmount + SelectResourceID[l].Amount;

                                        $scope.resourceAmount = ($scope.resourceAmount + parseFloat(SelectResourceID[l].Amount));
                                    }
                                }
                                //get amount from expense UI(pms cost table) end

                                var actlHourVal = 0;
                                ////// Push all per hour cost and planned budget into array
                                // obj.PerHourCostValue = $scope.resourceAmount / $scope.DividedBy;
                                obj.PerHourCostValue = ($scope.resourceAmount / $scope.DividedBy).toFixed(2);
                                obj.PlannedBudget = DurationSumvalue * obj.PerHourCostValue;  // planned budget is the total cost
                                $scope.DurationWithDetails.push(obj);
                            }




                            //////////////////////  get distinct resource,  perhour cost, duration,planned budget 
                            var ref = {};
                            var res = $scope.DurationWithDetails.reduce(function (arr, o) {
                                if (!(o.Name in ref)) {
                                    ref[o.Name] = arr.length;
                                    arr.push($.extend({}, o));

                                } else {
                                    arr[ref[o.Name]].Duration += o.Duration;
                                    arr[ref[o.Name]].PerHourCostValue + o.PerHourCostValue;
                                    arr[ref[o.Name]].PlannedBudget += o.PlannedBudget;
                                }
                                return arr;
                            }, []);

                            //bind Loaded Cost Datas: resource,per hour cost,duration, planned budget
                            $scope.DurationWithNames = res;

                            //////////////////////get distinct resource hours from team lead timesheet 
                            var Hourref = {};
                            var res1 = $scope.ActualHoursAndCost.reduce(function (Calculatehours, o) {
                                if (!(o.UserName in Hourref)) {
                                    Hourref[o.UserName] = Calculatehours.length;
                                    Calculatehours.push($.extend({}, o));

                                } else {
                                    Calculatehours[Hourref[o.UserName]].Hours += o.Hours;

                                }
                                return Calculatehours;
                            }, []);

                            $scope.DurationWithNamesMain = res1;

                            ////////////////////////////////// bind actual hour,actual cost,PlannedVsActual value
                            var obj = {}
                            // for (p = 0; p < $scope.DurationWithNamesMain.length; p++) {
                            //     debugger;
                            //     $scope.DurationWithNames[p].Name = $scope.DurationWithNamesMain[p].UserName;
                            //     actlHourVal = $scope.DurationWithNamesMain[p].Hours;
                            //     $scope.DurationWithNames[p].ActualHour = actlHourVal / 60;
                            //     $scope.DurationWithNames[p].ActualCost = $scope.DurationWithNames[p].PerHourCostValue * $scope.DurationWithNames[p].ActualHour;
                            //     $scope.DurationWithNames[p].PlannedVsActual = $scope.DurationWithNames[p].PlannedBudget - $scope.DurationWithNames[p].ActualCost;
                            // }

                            for (p = 0; p < $scope.DurationWithNames.length; p++) {
                                //   debugger;
                                if ($scope.DurationWithNamesMain[p] != undefined) {

                                    $scope.DurationWithNames[p].Name = $scope.DurationWithNames[p].Name;
                                    // alert($scope.DurationWithNames[p].Name); 
                                    actlHourVal = $scope.DurationWithNamesMain[p].Hours;
                                    $scope.DurationWithNames[p].ActualHour = actlHourVal / 60;

                                    $scope.DurationWithNames[p].ActualCost = ($scope.DurationWithNames[p].PerHourCostValue * $scope.DurationWithNames[p].ActualHour).toFixed(2);
                                    $scope.DurationWithNames[p].PlannedVsActual = ($scope.DurationWithNames[p].PlannedBudget - $scope.DurationWithNames[p].ActualCost).toFixed(2);

                                }
                                else {
                                    $scope.DurationWithNames[p].ActualHour = 0;
                                    $scope.DurationWithNames[p].ActualCost = 0;
                                    $scope.DurationWithNames[p].PlannedVsActual = 0;
                                }
                            }

                            //get overall summary of Actual hour cost, plannedvsactual start
                            $scope.TotalEffort = 0;
                            $scope.TotalBudget = 0;
                            $scope.TotalActualHour = 0;
                            $scope.TotalActualCost = 0;
                            $scope.TotalPlannedVsActuals = 0;
                            for (s = 0; s < $scope.DurationWithNames.length; s++) {
                                //     debugger;
                                $scope.TotalEffort = $scope.TotalEffort + $scope.DurationWithNames[s].Duration;
                                $scope.TotalBudget = $scope.TotalBudget + $scope.DurationWithNames[s].PlannedBudget;
                                $scope.TotalActualHour = $scope.TotalActualHour + $scope.DurationWithNames[s].ActualHour;
                                $scope.TotalActualCost = $scope.TotalActualCost + parseFloat($scope.DurationWithNames[s].ActualCost);
                                $scope.TotalPlannedVsActuals = ($scope.TotalBudget - $scope.TotalActualCost).toFixed(2);
                            }

                            //get overall summary of Actual hour cost, plannedvsactual end


                            $http.get('/Getteamleader/' + ProjectID).then(function (response) {
                                $scope.GetteamleaderDetails = response.data;
                                if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                                    $scope.FileUploadVisible = true;
                                } else {
                                    if (MainTabText != "Grid2") { $scope.FileUploadVisible = false; }
                                    if (MainTabText == "Grid3") {
                                        $scope.FileUploadVisible = false;
                                    }

                                }
                                $http.get('/GetteamMemberDetailsForTask/' + ProjectID).then(function (response) {
                                    $scope.GetteamMemberDetailsForTask = response.data;
                                    if ($scope.GetteamMemberDetailsForTask.length == 0) {
                                        $notify.warning('warning', "No Members are allocated for selected Project");
                                        $scope.FileUploadVisible = false;
                                        return;
                                    } else {
                                        if ($scope.GetteamleaderDetails[0].TeamLeaderUserID == username && MainTabText != "Grid2") {
                                            $scope.FileUploadVisible = true;
                                        }
                                        if (MainTabText == "Grid3") { $scope.FileUploadVisible = false; }
                                    }
                                });

                            });
                        });
                    });

                });

            }
            else {
                $scope.FileUploadVisible = false;
            }
        }


        //add new task project Name dropdown


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

        var getProjectName = function (Getteamdetail) {
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



        $scope.EndDateEnable = true;
        $scope.StartDateChange = function (date, ProjectID) {
            ;

            var date1 = date;
            $http.get('/GetProjectEndDate/' + ProjectID + '/' + FacilityService).then(function (response) {

                var ProjEndDate = response.data[0].EndDate;

                var ProjEndday = parseInt(ProjEndDate.substring(0, 2));
                var ProjEndmonth = parseInt(ProjEndDate.substring(3, 5));
                var ProjEndyear = parseInt(ProjEndDate.substring(6, 10));

                var Endday = parseInt(date1.substring(0, 2));
                var Endmonth = parseInt(date1.substring(3, 5));
                var Endyear = parseInt(date1.substring(6, 10));


                var ProjEndDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                var EndDateChk = new Date(Endyear, Endmonth, Endday);

                if (ProjEndDateChk < EndDateChk) {
                    $notify.warning('warning', 'Task Start Date is Greater than Project End Date');
                    $scope.disableds = true;
                    $scope.Enddatedisable = true;
                    return false;
                }
                else {
                    $scope.Enddatedisable = false;
                }

            });
            document.getElementById('AddEndDate').value = "";
            $http.get('/GetProjectEndDate/' + ProjectID + '/' + FacilityService).then(function (response) {


                var ProjStartDate = response.data[0].StartDate;
                var ProjEndday = parseInt(ProjStartDate.substring(0, 2));
                var ProjEndmonth = parseInt(ProjStartDate.substring(3, 5));
                var ProjEndyear = parseInt(ProjStartDate.substring(6, 10));

                var Endday = parseInt(date.substring(0, 2));
                var Endmonth = parseInt(date.substring(3, 5));
                var Endyear = parseInt(date.substring(6, 10));


                var ProjstartDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                var startDateChk = new Date(Endyear, Endmonth, Endday);



                if (ProjstartDateChk > startDateChk) {
                    $notify.warning('warning', 'Task Start Date is Greater than Project Start Date');
                    $scope.disableds = true;
                    $scope.Enddatedisable = true;
                    return false;
                } else {
                    $scope.Enddatedisable = false;
                }




                $scope.EndDateRestrict = $scope.ManageTask.EndDate;


                var startDate = $scope.ManageTask.PlanStartDate.split("-");
                var endDate = $scope.ManageTask.PlanEndDate.split("-");




                var startDate1 = $scope.ManageTask.PlanStartDate;
                var endDate2 = $scope.ManageTask.PlanEndDate;

                var curDate = new Date();


                if (startDate[2] > endDate[2]) {
                    $notify.warning('warning', 'End Date should be greater than start date');
                    $scope.disableds = true;
                    return false;
                }
                else {
                    if (startDate[1] < endDate[1]) {

                        return;
                    }
                    else {
                        if (startDate[1] > endDate[1]) {
                            $notify.warning('warning', 'End Date should be greater than start date');
                            $scope.disableds = true;
                            return false;
                        }
                        else {
                            if (startDate[0] < endDate[0]) {

                            }
                        }
                    }

                }
            });

        }








        $scope.EndateChange = function (date, ProjectID) {

            var date1 = date;
            $http.get('/GetProjectEndDate/' + ProjectID + '/' + FacilityService).then(function (response) {

                var ProjEndDate = response.data[0].EndDate;

                var ProjEndday = parseInt(ProjEndDate.substring(0, 2));
                var ProjEndmonth = parseInt(ProjEndDate.substring(3, 5));
                var ProjEndyear = parseInt(ProjEndDate.substring(6, 10));

                var Endday = parseInt(date1.substring(0, 2));
                var Endmonth = parseInt(date1.substring(3, 5));
                var Endyear = parseInt(date1.substring(6, 10));


                var ProjEndDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                var EndDateChk = new Date(Endyear, Endmonth, Endday);

                if (ProjEndDateChk < EndDateChk) {
                    $notify.warning('warning', 'Task End Date is Greater than Project End Date');
                    $scope.disableds = true;
                    return false;
                }

            });

            $scope.EndDateRestrict = date;
            var startDate = $scope.ManageTask.PlanStartDate.split("-");
            var endDate = $scope.ManageTask.PlanEndDate.split("-");

            var startDate1 = $scope.ManageTask.PlanStartDate;
            var endDate2 = $scope.ManageTask.PlanEndDate;

            var TotalFromDate = startDate[1] + '/' + startDate[0] + '/' + startDate[2];
            var TotalToDate = endDate[1] + '/' + endDate[0] + '/' + endDate[2];
            var date = new Date(TotalFromDate);
            var date2 = new Date(TotalToDate);
            if (date > date2) {
                $notify.warning('warning', "End Date must be greater than Start Date");
                $scope.disableds = true;
                return true;
            }
            var curDate = new Date();
            if (startDate[2] < endDate[2]) {
                return;
            }
            if (startDate[2] > endDate[2]) {
                $notify.warning('warning', 'End year should be greater than start year');
                $scope.disableds = true;
                return false;
            }
            else {
                if (startDate[1] > endDate[1]) {
                    $notify.warning('warning', 'End Date should be greater than start date');
                    $scope.disableds = true;
                    return false;
                }
                else {
                    if (startDate[0] > endDate[0]) {

                    }
                    else {
                        $scope.disableds = false;
                        return '';
                    }
                }
            }



        }




        $http.get('/PMSConfig/TaskContent.json').success(function (data) {

            $scope.Phase = data.Phase;
            $scope.Type = data.Type;
            $scope.IsBIllable = data.IsBIllable;
            $scope.IsCR = data.IsCR;
        });

        var getprojdetails = function () {
            ;
            $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
                $scope.GetProjectDetails = response.data;

            });
        }




        getprojdetails();
        var DateCalculation = function (Finish) {

            var day = parseInt(Finish.substring(0, 2));
            var month = parseInt(Finish.substring(3, 5));
            var year = parseInt(Finish.substring(6, 10));
            var date = new Date(year, month - 1, day);
            return date;

        };

        $scope.UniqueIndentityScopeDisable = true;
        var getResourceName = function () {
            ;
            var maxUniqueID = 0;
            var c = document.getElementById("ProjectIDDrop");
            var ProjectId = c.options[c.selectedIndex].value;
            var ProjectName = ProjectId;
            var GridProjectID = ProjectId;
            $http.get('/GetResourcesBasedProject1/' + ProjectName).then(function (response) {
                $scope.GetResourcesBasedProjects = response.data;
                $http.get('/GetTaskGridValues/' + ProjectId + '/' + FacilityService).then(function (response) {
                    $scope.GetmaxUniqueID = response.data;
                    //UniqueID
                    if ($scope.GetmaxUniqueID.length > 0) {
                        var maxUniqueID = Math.max.apply(null, $scope.GetmaxUniqueID.map(function (item) {
                            return item.UniqueID;
                        }));
                        if (ProjectName != null || ProjectName != undefined) {
                            $scope.ManageTask = { UniqueID: (maxUniqueID + 1) };
                        } else {
                            $scope.ManageTask = { UniqueID: "" };
                        }
                    }
                    else {
                        $scope.ManageTask = { UniqueID: 1 };
                    }

                });

            });
            if (ProjectName != null || ProjectName != undefined) {
                $scope.ManageTask = { UniqueID: (maxUniqueID + 1) };
            } else {
                $scope.ManageTask = { UniqueID: "" };
            }
        }


        $scope.SaveTask = function () {
            
            var isMailSend = 0;
            if ($scope.ManageTask.isMailSend == true) {
                var isMailSend = 1;
            }
            var getusermailid = $scope.ManageTask.TeamMemberUserID;
            var c = document.getElementById("ProjectIDDrop");
            var ProjectId = c.options[c.selectedIndex].value;

            var ProjectNameforMail = getProjectName(ProjectId);
            $scope.ManageTask.ProjectID = ProjectId;
            $http.post('/AddTaskBasedFacility',
                {
                    'TaskDescription': $scope.ManageTask.TaskDescription,
                    Duration: $scope.ManageTask.Duration,
                    PlanStartDate: $scope.ManageTask.PlanStartDate,
                    PlanEndDate: $scope.ManageTask.PlanEndDate,
                    ActualEndDate: "",
                    ActualDuration: "",
                    ProjectID: $scope.ManageTask.ProjectID,
                    TaskCategoryName: $scope.ManageTask.TaskCategoryName,
                    TaskStatusName: "Queue",
                    TaskPriorityName: "High",
                    TeamLeaderUserID: username,
                    isMailSend: isMailSend,
                    ResourceComments: "",
                    TeamMemberUserID: $scope.ManageTask.TeamMemberUserID,
                    IsVisible: 1,
                    UniqueID: $scope.ManageTask.UniqueID,
                    TypeNew: $scope.ManageTask.TypeNew,
                    IsBillable: $scope.ManageTask.IsBillable,
                    IsCR: $scope.ManageTask.IsCR,
                    Predecessors: $scope.ManageTask.Predecessors,
                    CreateById: username,
                    UpdateById: username,
                    CreateOn: Date.now(),

                    'FacilityID': FacilityService
                }).then(function (response) {

                    $notify.success('success', 'Task Added successfully');
                    getrefreshdata($scope.ManageTask.ProjectID)
                    $scope.ManageTask = '';
                    if (isMailSend == 1) {
                        $http.get('/GetUserEmailID/' + getusermailid).then(function (response) {
                            $scope.GetUserEmail = response.data;
                            var sendemail = $scope.GetUserEmail[0].Email;

                            $http.post('/ProjectAllotNotification', {
                                "TeamLeaderID": getusermailid,
                                "ProjectNameInfo": ProjectNameforMail,
                                "email": sendemail
                            }).then(function (response) {


                            });
                        });
                    }

                });
        }

        //get Configurable item  Name from Configurable Item table

        $http.get('/ConfigureItems_Show/' + FacilityService).then(function (response) {
            $scope.ConfigurableItemNames = response.data;

        });

        //Excel download Code
        $scope.ExcelExport = function () {

            //  debugger;

            $http.get('/PMSConfig/TaskContent.json').success(function (data) {

                $scope.Phase = data.Phase;
                $scope.Type = data.Type;
                $scope.IsBIllable = data.IsBIllable;
                $scope.IsCR = data.IsCR;
                $scope.ProjectNameInfo = data.ProjectNameInfo[0].key;

                $scope.ConfigureItemsIDInfo = data.ConfigureItemsIDInfo[0].key;

                $scope.ConfigureItemsNameInfo = data.ConfigureItemsNameInfo[0].key;
                $scope.ConfigureItemsDescriptionInfo = data.ConfigureItemsDescriptionInfo[0].key;

                $scope.UniqueIDInfo = data.UniqueIDInfo[0].key + '/%*' + data.UniqueIDInfo[1].key;
                $scope.NameInfo = data.NameInfo[0].key + '/%*' + data.NameInfo[1].key;
                $scope.ResourceNamesInfo = data.ResourceNamesInfo[0].key + '/%*' + data.ResourceNamesInfo[1].key;
                $scope.DurationInfo = data.DurationInfo[0].key;
                $scope.StartInfo = data.StartInfo[0].key + '/%*' + data.StartInfo[1].key + '/%*' + data.StartInfo[2].key;
                $scope.FinishInfo = data.FinishInfo[0].key + '/%*' + data.FinishInfo[1].key + '/%*' + data.FinishInfo[2].key;
                $scope.PredecessorsInfo = data.PredecessorsInfo[0].key;
                $scope.PhaseInfo = data.PhaseInfo[0].key;

                var ExcelPhase = '';
                var ExcelType = '';
                var ExcelIsBIllable = '';
                var ExcelIsCR = '';
                var ConfigurableItem = '';
                //configurable items


                for (i = 0; i < $scope.ConfigurableItemNames.length; i++) {
                    if (i == 0) {
                        ConfigurableItem = $scope.ConfigurableItemNames[i].Name;
                    }
                    else {
                        ConfigurableItem += ',' + $scope.ConfigurableItemNames[i].Name;
                    }
                }
                var ConfigurableItemC = '"' + ConfigurableItem + '"';

                //configurable items


                for (i = 0; i < $scope.Phase.length; i++) {
                    if (i == 0) {
                        ExcelPhase = $scope.Phase[i].key;


                    }
                    else {
                        // if($scope.Phase[i].key=="Handover/Takeover")
                        // {
                        //$scope.Phase[i].key="*";
                        // }
                        ExcelPhase += ',' + $scope.Phase[i].key;
                    }
                }
                var ExcelPhaseC = '"' + ExcelPhase + '"';
                for (i = 0; i < $scope.Type.length; i++) {
                    if (i == 0) {
                        ExcelType = $scope.Type[i].key;
                    }
                    else {
                        ExcelType += ',' + $scope.Type[i].key;
                    }
                }
                var ExcelTypeC = '"' + ExcelType + '"';
                for (i = 0; i < $scope.IsBIllable.length; i++) {
                    if (i == 0) {
                        ExcelIsBIllable = $scope.IsBIllable[i].key;
                    }
                    else {
                        ExcelIsBIllable += ',' + $scope.IsBIllable[i].key;
                    }
                }
                var ExcelIsBIllableC = '"' + ExcelIsBIllable + '"';
                for (i = 0; i < $scope.IsCR.length; i++) {
                    if (i == 0) {
                        ExcelIsCR = $scope.IsCR[i].key;
                    }
                    else {
                        ExcelIsCR += ',' + $scope.IsCR[i].key;
                    }
                }
                var ExcelIsCRC = '"' + ExcelIsCR + '"';
                ExcelPhaseC = ExcelPhaseC.replace(/'"'(\s|$)/g, "")
                // ExcelPhaseC=ExcelPhaseC.replace('Leave"',"Leave");

                for (i = 0; i < $scope.GetNewProjectDetails.length; i++) {
                    if (i == 0) {
                        ExcelProjectName = $scope.GetNewProjectDetails[i].ProjectName;
                    }
                    else {
                        ExcelProjectName += ',' + $scope.GetNewProjectDetails[i].ProjectName;
                    }
                }
                var ExcelProjectNameC = '"' + ExcelProjectName + '"';




                for (i = 0; i < $scope.GetUserNames.length; i++) {
                    if (i == 0) {
                        ExcelUserName = $scope.GetUserNames[i].UserName;
                    }
                    else {
                        ExcelUserName += ',' + $scope.GetUserNames[i].UserName;
                    }
                }
                var ExcelUserNameC = '"' + ExcelUserName + '"';
                function replaceMulti(haystack, needle, replacement) {
                    return haystack.split(needle).join(replacement);
                }


                ExcelPhaseC = (replaceMulti(ExcelPhaseC, '"', ''));
                ExcelUserNameC = (replaceMulti(ExcelUserNameC, '"', ''));
                ExcelProjectNameC = (replaceMulti(ExcelProjectNameC, '"', ''));
                $http.post('/GetexcelSheet/' + ExcelPhaseC + '/' + ExcelTypeC + '/' + ExcelIsBIllableC + '/' + ExcelIsCRC + '/' + ConfigurableItemC + '/' + FacilityService + '/' + ExcelProjectNameC + '/' + ExcelUserNameC, {
                    "ProjectNameInfo": $scope.ProjectNameInfo,
                    "UniqueIDInfo": $scope.UniqueIDInfo,
                    "NameInfo": $scope.NameInfo,
                    "ResourceNamesInfo": $scope.ResourceNamesInfo,
                    "DurationInfo": $scope.DurationInfo,
                    "StartInfo": $scope.StartInfo,
                    "FinishInfo": $scope.FinishInfo,
                    "PredecessorsInfo": $scope.PredecessorsInfo,
                    "PhaseInfo": $scope.PhaseInfo,
                    "ConfigureItemsIDInfo": $scope.ConfigureItemsIDInfo,
                    "ConfigureItemsNameInfo": $scope.ConfigureItemsNameInfo,
                    "ConfigureItemsDescriptionInfo": $scope.ConfigureItemsDescriptionInfo,


                }).then(function (response) {
                    debugger
                    var url = '/template/' + response.data;
                    $window.open(url);

                });



            });
        }



        ////Excel Upload Code
        var X = XLSX;
        var MainSheetName = '';
        var XW = {
            msg: 'xlsx',
            norABS: './xlsxworker1.js'

        };
        var rABS = true;
        var use_worker = true;
        var transferable = use_worker;
        var wtf_mode = false;
        function ab2str(data) {

            var o = "", l = 0, w = 10240;
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
            return o;
        } debugger
        try {
            function xw_xfer(data, cb) {
                var worker = new Worker(rABS ? XW.rABS : XW.norABS);

                worker.onmessage = function (e) {

                    switch (e.data.t) {
                        case 'ready': break;
                        case 'e':
                            $notify.warning('Warning', 'File extension not allowed');
                            return '';
                        default: var xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                            cb(JSON.parse(xx)); break;
                    }

                };

                worker.postMessage(data, [data]);

            }
        } catch (error) {
            alert(error);
        }
        function xw(data, cb) {
            transferable = true;
            xw_xfer(data, cb);
        }
        var result = "";
        function to_json(workbook) {
            var result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                if (sheetName == "TaskSheet") {
                    $scope.Sheetname = sheetName;
                    MainSheetName = sheetName;
                    var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    if (roa.length > 0) {
                        result[sheetName] = roa;
                    }
                }

            });
            return result;
        }
        var tarea = document.getElementById('b64data');
        function b64it() {
            if (typeof console !== 'undefined')
                var wb = X.read(tarea.value, { type: 'base64', WTF: wtf_mode });
            process_wb(wb);
        }
        window.b64it = b64it;
        var global_wb;
        function process_wb(wb) {
            global_wb = wb;
            var output = "";
            var output1 = "";
            switch ("json") {
                case "json":
                    output = JSON.stringify(to_json(wb), 2, 2);
                    output1 = JSON.parse(output);
                    if (output1.TaskSheet == undefined) {
                        return '';
                    }
                    else {
                    }
            }
            $scope.MainInfo = output1;

            for (var headers in output1.TaskSheet[0]) {
                var ExcelFacility = output1.TaskSheet[0][headers];
                if (headers != "ProjectName" && headers != undefined && headers != "UniqueID" && headers != "Name"
                    && headers != "Resource" && headers != "FacilityID" &&
                    headers != "Type" && headers != "IsBillable" && headers != "IsCR"
                    && headers != "Effort" && headers != "StartDate" && headers != "EndDate" && headers != "Predecessors"
                    && headers != "Phase" && headers != "FacilityID" && headers != "ConfigurableItem") {
                    alert("column Names mismatced");
                    return;
                }
                if (headers == "FacilityID") {
                    if (ExcelFacility == FacilityService) {
                        var SelectStreams = [];
                        SelectStreams = $filter('filter')($scope.ViewFacilitys, { _id: ExcelFacility });
                        if (SelectStreams.length == 0) {
                            alert("facility mismatced");
                            return;
                        }
                    }
                    else {
                        alert("facility mismatced");
                        return;
                    }


                }

            }
            //Check Empty Rows and Excel dropdown values like Type,IsBillable,IsCR,Phase configurableItem
            var CheckUniqueID = '';
            $scope.TaskData = [];
            for (var i = 0; i < output1.TaskSheet.length; i++) {
                ;

                var obj = {};
                var ProjectName = output1.TaskSheet[i].ProjectName;
                var UniqueID = output1.TaskSheet[i].UniqueID;
                var Name = output1.TaskSheet[i].Name;
                var ResourceNames = output1.TaskSheet[i].Resource;
                var Type = output1.TaskSheet[i].Type;
                var IsBillable = output1.TaskSheet[i].IsBillable;
                var IsCR = output1.TaskSheet[i].IsCR;
                var Duration = output1.TaskSheet[i].Effort;

                var ConfigurableItem = output1.TaskSheet[i].ConfigurableItem || "DBScript";

                var Start = output1.TaskSheet[i].StartDate;//12=4/6513
                if (Start != undefined) {
                    Start = Start.replace("/", "-").replace("/", "-");

                    Start = Start.split('-')[1] + "-" + Start.split('-')[0] + "-" + Start.split('-')[2];
                    output1.TaskSheet[i].StartDate = Start
                }


                var Finish = output1.TaskSheet[i].EndDate;
                if (Finish != undefined) {
                    Finish = Finish.replace("/", "-").replace("/", "-");
                    Finish = Finish.split('-')[1] + "-" + Finish.split('-')[0] + "-" + Finish.split('-')[2];
                    output1.TaskSheet[i].EndDate = Finish;
                }
                var Predecessors = output1.TaskSheet[i].Predecessors;
                var Phase = output1.TaskSheet[i].Phase;
                // alert(Phase);
                if (i == 0) {
                    var FacilityCheck = output1.TaskSheet[i].FacilityID;
                    if (FacilityCheck == undefined || FacilityCheck == "") {
                        alert("Work Sheet is Empty" + (i + 2));
                        return;
                    }
                }
                if (ProjectName == undefined || ProjectName == "" || UniqueID == undefined || UniqueID == ""
                    || Name == undefined || Name == "" || ResourceNames == undefined || ResourceNames == ""
                    || Type == undefined || Type == "" || IsBillable == undefined || IsBillable == "" ||
                    IsCR == undefined || IsCR == "" || Duration == undefined || Duration == "" || Start == undefined || Start == ""
                    || Finish == undefined || Finish == ""
                    || Phase == undefined || Phase == "" ||
                    ConfigurableItem == undefined || ConfigurableItem == "") {
                    alert("Work Sheet is Empty" + (i + 2));
                    return;
                }
                //Check Dropdown Values
                var SelectTypeStreams = [];
                SelectTypeStreams = $filter('filter')($scope.Type, { key: Type });
                if (SelectTypeStreams.length == 0) { alert("Not Valid Type Check Work Sheet No " + (i + 2)); return; }

                var SelectIsBIllStreams = [];
                SelectIsBIllStreams = $filter('filter')($scope.IsBIllable, { key: IsBillable });
                if (SelectIsBIllStreams.length == 0) { alert("Not Valid IsBillable Work Sheet No " + (i + 2)); return; }

                var SelectIsCRStreams = [];
                SelectIsCRStreams = $filter('filter')($scope.IsCR, { key: IsCR });
                if (SelectIsCRStreams.length == 0) { alert("Not Valid IsCR Check Work Sheet No " + (i + 2)); return; }

                var SelectPhaseStreams = [];
                SelectPhaseStreams = $filter('filter')($scope.Phase, { key: Phase });
                if (SelectPhaseStreams.length == 0) { alert("Not Valid Phase Check  Work Sheet No " + (i + 2)); return; }
                //ConfigurableItem


                var SelectConfigurableItem = [];
                SelectConfigurableItem = $filter('filter')($scope.ConfigurableItemNames, { Name: ConfigurableItem });
                if (SelectConfigurableItem.length == 0) { alert("Not Valid Configurable Item  Check  Work Sheet No " + (i + 2)); return; }

                //ConfigurableItem


                //Check Project Names
                var SelectProjectDetailsStreams = [];
                SelectProjectDetails = $filter('filter')($scope.GetNewProjectDetails, { ProjectName: ProjectName });
                if (SelectProjectDetails.length == 0) { alert("Not Valid Project Name  Check  Work Sheet No " + (i + 2)); return; }

                //Check Uploaded Project Name
                var c = document.getElementById("ProjectIDDrop");
                var ProjectId = c.options[c.selectedIndex].text;
                if (ProjectId != ProjectName) { alert("Project Mismatched  Check  Work Sheet No " + (i + 2)); return; }

                ///Check Resources Name
                var SelectGetteamMemberDetailsForTaskStreams = [];
                SelectGetteamMemberDetailsForTaskStreams = $filter('filter')($scope.GetteamMemberDetailsForTask, { TeamMemberUserID: ResourceNames });
                if (SelectGetteamMemberDetailsForTaskStreams.length == 0) {
                    alert("Not Valid ResourceNames  Check  Work Sheet No " + (i + 2));
                    return;
                }
                //Check Access permission
                if ($scope.FileUploadVisible == false) { alert("Access Denied to upload Task Worksheet for selected Project"); return; }

                //Check input type field like uniqueid,duration
                if (isNaN(UniqueID)) {
                    alert("UniqueID Format is mimatched  Check  Work Sheet No " + (i + 2));
                    return;
                }
                if (isNaN(Duration)) {
                    alert("Duration Format is mimatched  Check  Work Sheet No " + (i + 2));
                    return;
                }
                //Check uniqueid
                var valueArr = output1.TaskSheet.map(function (item) { return item.UniqueID });
                var isDuplicate = valueArr.some(function (item, idx) {
                    return valueArr.indexOf(item) != idx
                });
                if (isDuplicate == true) { alert("UniqueID Format is mismatched  Check  Work Sheet"); return; }

                var c = document.getElementById("ProjectIDDrop");
                var ProjectId = c.options[c.selectedIndex].text;
                var SelectProjectDetailsStreams = [];
                SelectProjectDetailsStreams = $filter('filter')($scope.GetNewProjectDetails, { ProjectName: ProjectId });
                var PjstartDate = SelectProjectDetailsStreams[0].StartDate;
                var PjEndtDate = SelectProjectDetailsStreams[0].EndDate;


                //date validation
                var date2 = DateCalculation(Finish);
                var date1 = DateCalculation(Start);
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                diffDays++;
                if (diffDays == 0) { diffDays = 1 }
                var DurationDays = Duration / 8;
                var deviahours = diffDays * 8;

                if (DurationDays > deviahours) {
                    alert(" Duration of task cant fit between task start and end date in row No " + (i + 2));
                    return;
                }
                if (DurationDays > diffDays) {
                    alert(" Duration of task cant fit between task start and end date in row No " + (i + 2));
                    return;
                }


                $scope.Start = Start;
                // PjstartDate =   $scope.Start;
                var excelstartdate = Start;

                $scope.Finish = Finish;
                var excelenddate = $scope.Finish;
                var startDate = excelstartdate.split("-");
                var endDate = excelenddate.split("-");


                var ProjstartDateChk = new Date(startDate[1] + "-" + startDate[0] + "-" + startDate[2]);
                var EndDateChk = new Date(endDate[1] + "-" + endDate[0] + "-" + endDate[2]);

                if (ProjstartDateChk > EndDateChk) {
                    alert('Task Start Date is Greater than  End Date in row No ' + (i + 2));

                    return;
                }




                //start date validation
                var ProjStartDate = PjstartDate;
                var ProjEndday = parseInt(ProjStartDate.substring(0, 2));
                var ProjEndmonth = parseInt(ProjStartDate.substring(3, 5));
                var ProjEndyear = parseInt(ProjStartDate.substring(6, 10));

                var Endday = parseInt(excelstartdate.substring(0, 2));
                var Endmonth = parseInt(excelstartdate.substring(3, 5));
                var Endyear = parseInt(excelstartdate.substring(6, 10));


                var ProjstartDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                var startDateChk = new Date(Endyear, Endmonth, Endday);

                if (ProjstartDateChk > startDateChk) {
                    alert(" Task start date is greater than Project Start Date in row No " + (i + 2));
                    $scope.disableds = true;
                    return;
                }

                //End date validation


                var ProjEndDate = PjEndtDate;
                var ProjEndday = parseInt(ProjEndDate.substring(0, 2));
                var ProjEndmonth = parseInt(ProjEndDate.substring(3, 5));
                var ProjEndyear = parseInt(ProjEndDate.substring(6, 10));

                var Endday = parseInt(excelenddate.substring(0, 2));
                var Endmonth = parseInt(excelenddate.substring(3, 5));
                var Endyear = parseInt(excelenddate.substring(6, 10));


                var ProjEndDateChk = new Date(ProjEndyear, ProjEndmonth, ProjEndday);
                var EndDateChk = new Date(Endyear, Endmonth, Endday);

                if (ProjEndDateChk < EndDateChk) {
                    alert(" Task End date is greater than Project End Date in row No " + (i + 2));
                    return;
                }
            }


            $http.get('/GetTaskBasedFacilityDetails/' + FacilityService).then(function (response) {
                $scope.GetTaskBasedFacilityDetails = response.data;

                $scope.TaskData = [];
                $scope.AlreadyExistsTaskData = [];
                var ProjectID = '';
                for (var i = 0; i < output1.TaskSheet.length; i++) {

                    var obj = {};
                    var ProjectName = output1.TaskSheet[i].ProjectName;
                    var UniqueID = output1.TaskSheet[i].UniqueID;
                    var Name = output1.TaskSheet[i].Name;
                    var ResourceNames = output1.TaskSheet[i].Resource;
                    var Type = output1.TaskSheet[i].Type;
                    var IsBillable = output1.TaskSheet[i].IsBillable;
                    var IsCR = output1.TaskSheet[i].IsCR;
                    var Duration = output1.TaskSheet[i].Effort;
                    var Start = output1.TaskSheet[i].StartDate;
                    var Finish = output1.TaskSheet[i].EndDate;
                    var Predecessors = output1.TaskSheet[i].Predecessors;
                    var Phase = output1.TaskSheet[i].Phase;
                    var c = document.getElementById("ProjectIDDrop");
                    var AddProjectId = c.options[c.selectedIndex].value;
                    ProjectID = AddProjectId;

                    var SelectTaskDetailsStreams = [];
                    SelectTaskDetailsStreams = $filter('filter')($scope.GetTaskBasedFacilityDetails, { ProjectID: AddProjectId, UniqueID: UniqueID, FacilityID: FacilityService });
                    if (SelectTaskDetailsStreams.length == 0) {
                        obj.TaskDescription = Name;
                        obj.PlanStartDate = Start;
                        obj.Duration = Duration;
                        obj.PlanEndDate = Finish;
                        obj.ActualEndDate = null;
                        obj.ActualDuration = null;
                        var c = document.getElementById("ProjectIDDrop");
                        var AddProjectId = c.options[c.selectedIndex].value;
                        obj.ProjectID = AddProjectId;
                        obj.TaskCategoryName = Phase;
                        obj.TaskStatusName = "Queue";
                        obj.TaskPriorityName = "High";
                        obj.TeamLeaderUserID = username;
                        obj.isMailSend = 1;
                        obj.ResourceComments = null;
                        obj.TeamMemberUserID = ResourceNames;
                        obj.IsVisible = 1;
                        obj.UniqueID = UniqueID;
                        obj.TypeNew = Type;
                        obj.IsBillable = IsBillable;
                        obj.IsCR = IsCR;
                        obj.Predecessors = Predecessors;
                        obj.CreateById = username;
                        obj.CreateOn = $filter('date')(new Date(), 'dd-MM-yyyy');
                        obj.UpdateById = username;
                        obj.FacilityID = FacilityService;
                        if (obj.isMailSend == 1) {

                            $http.get('/GetUserEmailID/' + ResourceNames).then(function (response) {
                                $scope.GetUserEmail = response.data;
                                var sendemail = $scope.GetUserEmail[0].Email;

                                // $http.post('/ProjectAllotNotification', {
                                //     "TeamLeaderID": ResourceNames,
                                //     "ProjectNameInfo": ProjectName,
                                //     "email": sendemail
                                // }).then(function (response) {


                                // });
                            });
                        }
                        $scope.TaskData.push(obj);
                    }
                    else {
                        obj.id = SelectTaskDetailsStreams[0]._id;
                        obj.TaskDescription = Name;
                        obj.PlanStartDate = Start;
                        obj.Duration = Duration;
                        obj.PlanEndDate = Finish;
                        var c = document.getElementById("ProjectIDDrop");
                        var AddProjectId = c.options[c.selectedIndex].value;
                        obj.ProjectID = AddProjectId;
                        obj.TaskCategoryName = Phase;
                        obj.TeamLeaderUserID = username;
                        obj.TeamMemberUserID = ResourceNames;
                        obj.UniqueID = UniqueID;
                        obj.TypeNew = Type;
                        obj.IsBillable = IsBillable;
                        obj.IsCR = IsCR;
                        obj.Predecessors = Predecessors;
                        obj.CreateById = username;
                        obj.CreateOn = $filter('date')(new Date(), 'dd-MM-yyyy');
                        obj.UpdateById = username;
                        obj.FacilityID = FacilityService;
                        $scope.AlreadyExistsTaskData.push(obj);
                    }

                }
                //Update AlreadyExists Record
                if ($scope.AlreadyExistsTaskData.length != 0) {
                    //     debugger;
                    for (i = 0; i < $scope.AlreadyExistsTaskData.length; i++) {
                        var id = $scope.AlreadyExistsTaskData[i].id;
                        var TaskDescription = $scope.AlreadyExistsTaskData[i].TaskDescription;
                        var PlanStartDate = $scope.AlreadyExistsTaskData[i].PlanStartDate;
                        var Duration = $scope.AlreadyExistsTaskData[i].Duration;
                        var PlanEndDate = $scope.AlreadyExistsTaskData[i].PlanEndDate;
                        var ProjectID = $scope.AlreadyExistsTaskData[i].ProjectID;
                        var TaskCategoryName = $scope.AlreadyExistsTaskData[i].TaskCategoryName;
                        var TeamLeaderUserID = $scope.AlreadyExistsTaskData[i].TeamLeaderUserID;
                        var TeamMemberUserID = $scope.AlreadyExistsTaskData[i].TeamMemberUserID;
                        var UniqueID = $scope.AlreadyExistsTaskData[i].UniqueID;
                        var TypeNew = $scope.AlreadyExistsTaskData[i].TypeNew;
                        var IsBillable = $scope.AlreadyExistsTaskData[i].IsBillable;
                        var Predecessors = $scope.AlreadyExistsTaskData[i].Predecessors;
                        if (Predecessors == undefined || Predecessors == '') {
                            Predecessors = 'empty';
                        }
                        var IsCR = $scope.AlreadyExistsTaskData[i].IsCR;
                        var CreateById = $scope.AlreadyExistsTaskData[i].CreateById;
                        var CreateOn = $scope.AlreadyExistsTaskData[i].CreateOn;
                        var UpdateById = $scope.AlreadyExistsTaskData[i].UpdateById
                        var FacilityID = $scope.AlreadyExistsTaskData[i].FacilityID;

                        $http.put('/UpdateManageTaskDetails', {
                            'id': id,
                            'TaskDescription': TaskDescription,
                            'PlanStartDate': PlanStartDate,
                            'Duration': Duration,
                            'PlanEndDate': PlanEndDate,
                            'ProjectID': ProjectID,
                            'TaskCategoryName': TaskCategoryName,
                            'TeamLeaderUserID': TeamLeaderUserID,
                            'TeamMemberUserID': TeamMemberUserID,
                            'UniqueID': UniqueID,
                            'TypeNew': TypeNew,
                            'IsBillable': IsBillable,
                            'Predecessors': Predecessors,
                            'IsCR': IsCR,
                            'CreateById': CreateById,
                            'CreateOn': CreateOn,
                            'UpdateById': UpdateById,
                            'FacilityID': FacilityID
                        }).then(function (response) {
                            $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                                $scope.GetTaskGridValues = response.data;
                                $notify.success('success', 'Task Uploaded successfully');
                            });

                        });
                    }

                }
                if ($scope.TaskData.length != 0) {

                    $http.post('/AddTaskBasedFacility', $scope.TaskData).then(function (response) {
                        $notify.success('success', 'Task Uploaded successfully');
                        $http.get('/Manage_Usershow').then(function (response) {

                            $scope.Manage_Users = response.data;
                            $http.get('/GetTaskGridValues/' + ProjectID + '/' + FacilityService).then(function (response) {
                                $scope.GetTaskGridValues = response.data;

                            });
                        });
                    });
                }
            });

            document.getElementById("xlf").value = "";
        }
        function setfmt() { if (global_wb) process_wb(global_wb); }
        window.setfmt = setfmt;

        var xlf = document.getElementById('xlf');
        function handleFile(e) {
            ;
            rABS = false;
            use_worker = true;

            var files = e.target.files;
            var f = files[0];
            var FileName = f.name;
            var fileextension = FileName.split('.');
            var ExtensionCount = 0;
            for (i = 0; i < fileextension.length; i++) {
                if (fileextension[i] == "xlsx") {
                    ExtensionCount++;

                }
            }
            if (ExtensionCount != 0) {
                // {
                var reader = new FileReader();
                reader.onload = function (e) {
                    if (typeof console !== 'undefined')
                        var data = e.target.result;
                    if (use_worker) {
                        xw(data, process_wb);
                    } else {
                        var wb;
                        if (rABS) {
                            wb = X.read(data, { type: 'binary' });
                        }
                        else {

                        }
                        process_wb(wb);
                    }
                };
                if (rABS) reader.readAsBinaryString(f);
                else reader.readAsArrayBuffer(f);

            }
            else {
                alert("invalid file");
            }
        }
        if (xlf.addEventListener) xlf.addEventListener('change', handleFile, false);


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
        logincheck();


        // Apply disabled days
        $scope.TaskPhaseUpdate = function () {

            var c = document.getElementById("ProjectIDDrop");
            var ProjectID = c.options[c.selectedIndex].value;

            if ($scope.GetTaskGridValues.length != 0) {

                for (i = 0; i < $scope.GetTaskGridValues.length; i++) {
                    var SelectResourceID = [];
                    var Phaseid = $scope.GetTaskGridValues[i]._id;
                    var PhasePlanEndDate = $scope.GetTaskGridValues[i].PlanEndDate;
                    var PhaseActualenddate = $scope.GetTaskGridValues[i].ActualEndDate;
                    if (PhaseActualenddate != null && PhaseActualenddate != undefined) {

                        var curr = (PhasePlanEndDate.split('-')[1] + '-' + PhasePlanEndDate.split('-')[0] + '-' + PhasePlanEndDate.split('-')[2]); // get current date
                        var NEWDATE = Date.parse(curr.replace('-', '/').replace('-', '/'));
                        var Penddate = new Date(NEWDATE);

                        var curr = (PhaseActualenddate.split('-')[1] + '-' + PhaseActualenddate.split('-')[0] + '-' + PhaseActualenddate.split('-')[2]); // get current date
                        var NEWDATE = Date.parse(curr.replace('-', '/').replace('-', '/'));
                        var Aenddate = new Date(NEWDATE);

                        if (Penddate <= Aenddate) {
                            $scope.GetTaskGridValues[i].DateMismatched = false;

                            $http.put('/updatetaskphase/' + Phaseid + '/' + PhaseActualenddate).then(function (response) {
                                $notify.success('success', 'Task Updated successfully');
                            });
                        }
                        else {
                            $scope.GetTaskGridValues[i].DateMismatched = true;
                        }
                    }
                }
            }
        }

    }]);


