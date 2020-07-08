
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var tabname = '';
var TimeSheetView = 0;
var TaskView = 1;
var viewtab = "";
var TaskViewCount = 0;
var username = "";
var hellovalue = "";
var hourcount = 0;
var Mainusername = "";



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

app.controller('TimeSheetCtrl', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {
        $scope.CurrentWeekStartDate = '';

        $scope.Showmessage = false;
        var StartDate1 = "";
        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {
            $scope.ProjectName = {};
            $scope.GetUserName = {};

            $scope.ProjectNamesMain = "Select";
            $scope.events = [];

            $scope.showtimesheet = false;
            if (newVal !== '') {
                FacilityService = newVal;
                refresh();
                ActiveUser();
            }
        });

        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;
        $scope.ShowPublish = false;
        var username = $cookieStore.get('LoggedinUser');
        var Mainusername = username;
        var refreshsUpdate = function () {
            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[9].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }

        var logincheck = function () {

            $http.get('loggedin').success(function (user) {

                // Authenticated
                if (user != '0') {
                    $scope.viewaccesspage = true;
                    refreshsUpdate();

                    return;

                }
                // Not Authenticated
                else {
                    $scope.viewaccesspage = false;

                    $window.location.href = '/';

                }
            });
        };
        logincheck();


        var refresh = function () {


            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }

            else {
                $http.get('/GetTaskTotHours/' + Mainusername + '/' + FacilityService).then(function (response) {
                    
                    $scope.getTaskTotalHours = response.data;

                });
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $scope.showtimesheet2 = true;
                var editpage = sessionStorage.getItem("EditTimeSheet");


                var dismove = "";

                var count = 0;


                $scope.events = [];

                $scope.navigatorConfig = {

                    selectMode: "week",
                    showMonths: 2,
                    skipMonths: 2,

                    onTimeRangeSelected: function (args) {

                        $scope.getAllWeekDays = [];
                        $scope.getalldates = [];
                        $scope.SelectStream1 = [];
                        if (getProjectID == "" || undefined) {
                            alert("Please Select Project")
                            refresh();
                            return true
                        } else {
                            $scope.weekConfig.startDate = args.day;

                            $scope.getStartdate = args.start;
                            $scope.getEnddate = args.end;
                            var Mainstart = $scope.getStartdate.toString().substring(0, 10);
                            var Mainend = $scope.getEnddate.toString().substring(0, 10);
                            var start = Mainstart.split('-');
                            var end = Mainend.split('-');
                            var StartDate = start[2];
                            var Year = parseInt(start[0]);
                            var StartYear = parseInt(start[0]);
                            var Month = parseInt(start[1]);
                            var Startmonth = parseInt(start[1]);
                            var Date1 = parseInt(start[2]);
                            var EndYear = parseInt(end[0]);
                            var OriginalEndYear = parseInt(end[0]);
                            var EndMonth = parseInt(end[1]);
                            var OriginalEndmonth = parseInt(end[1]);
                            var EndDate = parseInt(end[2]);
                            var OriginalEndDate = parseInt(end[2]);
                            var endloop = (Date1 + 6)

                            getweekdays(start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)

                            loadEvents(args);
                        }

                    }
                };


                $scope.weekConfig = {
                    visible: true,
                    viewType: "Week",
                    businessBeginsHour: 9,
                    businessEndsHour: 17,
                    eventMoveHandling: "Disabled",
                    eventResizeHandling: "Disabled", // to enable  Drag and Drop for TimeSheet   use "Update"
                    onTimeRangeSelected: function (args) {

                        var params = {
                            start: args.start.toString(),
                            end: args.end.toString(),
                            text: "New event"
                        };

                    },
                    onEventMove: function (args) {
                        var params = {
                            id: args.e.id(),
                            newStart: args.newStart.toString(),
                            newEnd: args.newEnd.toString()
                        };


                    },
                    onEventResize: function (args) {




                        if ($scope.SelectStream1[0].Publish == 1) {
                            $notify.warning('Warning', 'Timesheet already Published');
                            getTimeSheetrecords();
                            return true;
                        }
                        count = 0;
                        hours = 0

                        var start = args.newStart.toString();
                        var StartDate = start.substring(0, 10);
                        var year = StartDate.substring(0, 4);
                        var month = StartDate.substring(5, 7);
                        var date = StartDate.substring(8, 10);
                        var StartTime = start.substring(11, 16);
                        var fulldate = date + '-' + month + '-' + year;



                        StartDate1 = StartDate;
                        var end = args.newEnd.toString();
                        var endTime = end.substring(11, 16);

                        var text = "Activity";
                        var resource = getProjectID;
                        var Comments = "";
                        var Publish = 0;

                        var minutes = parseTime(endTime) - parseTime(StartTime);


                        $http.put('/UpdateResize', {
                            'id': args.e.id(),
                            'Start': args.newStart.toString(),
                            'End': args.newEnd.toString(),
                            'Hours': minutes
                        }).then(function (response) {

                            $notify.success('success', 'Timesheet updated Successfully');
                            var data = response.config.data;
                            $scope.TotHours = 0;


                            $http.get('/GetEvent1/' + data[0].Text + '/' + data[0].StartDate).then(function (response) {

                                $scope.EventID = response.data;
                                $http.put('/UpdateResize1', {
                                    'id': $scope.EventID[0]._id,
                                    'Start': args.newStart.toString(),
                                    'End': args.newEnd.toString(),
                                    'Hours': minutes
                                }).then(function (response) {


                                    var data = response.config.data;


                                });


                            });
                            GetUserTimeSheet();
                            getTimeSheetrecords();

                        });

                    },
                    onEventClick: function (args) {

                        count = 0;
                        hours = 0;
                        if ($scope.SelectStream1.length != 0) {
                            if ($scope.SelectStream1[0].Publish == 1) {
                                $notify.warning('Warning', 'Timesheet already Published');
                                return true;
                            }
                        }
                        var id = args.e.id();
                        $window.sessionStorage.setItem("getUserName", username);
                        $window.sessionStorage.setItem("gettaskid", args.e.id());
                        $window.sessionStorage.setItem("GetCurrentDate", args.e.data.start.value);
                        $window.sessionStorage.setItem("UserName", Mainusername);
                        $window.sessionStorage.setItem("FacilityID", FacilityService);
                        $http.get('/Getpublished/' + id).then(function (response) {

                            $scope.checkpublished = response.data;


                        });
                        $cookieStore.put('GetEvent', args.e.id());
                        var modal = new DayPilot.Modal({
                            onClosed: function (args) {


                                GetUserTimeSheet();
                                var TaskUpdateMessage = sessionStorage.getItem("TaskUpdateMessage");
                                var TimesheetUpdateMessage = sessionStorage.getItem("TimesheetUpdateMessage");
                                if (TaskUpdateMessage == "true") {
                                    $notify.success('success', 'TimeSheet Created Successfully');
                                    $window.sessionStorage.setItem("TaskUpdateMessage", false);
                                }
                                else if (TimesheetUpdateMessage == "true") {
                                    $notify.success('success', 'TimeSheet Updated Successfully');
                                    $window.sessionStorage.setItem("TimesheetUpdateMessage", false);
                                }

                                loadEvents(args);
                                if (args.result) {  // args.result is empty when modal is closed without submitting
                                    loadEvents(args);
                                }
                            }
                        });

                        if (viewtab == "TimeSheetView") {
                            if ($scope.SelectStream1[0].Publish == 0) {
                                var checkstartdate = new Date($scope.getAllWeekDays[0]);



                                if (checkstartdate.toDateString() == firstday.toDateString()) {
                                    $window.sessionStorage.setItem("CheckPreviousweek", "False");
                                }
                                else {
                                    $window.sessionStorage.setItem("CheckPreviousweek", "True");

                                }
                                $window.sessionStorage.setItem("getUserName", username);
                                modal.showUrl("EditTimesheet.html#/?id=" + args.e.id());
                            }
                            else {
                                $notify.warning('Warning', 'Timesheet already Published');
                                return true;
                            }

                        }

                        if (viewtab == "TaskView") {

                            
                            // if ($scope.CheckRecordPublish[0].Publish == 0) {

                            // }
                            // else {
                            //     $notify.warning('Warning', 'Timesheet already Published');
                            //     return true;
                            // }
                            var checkstartdate = new Date($scope.getAllWeekDays[0]);



                            if (checkstartdate.toDateString() == firstday.toDateString()) {
                                $window.sessionStorage.setItem("CheckPreviousweek", "False");
                            }
                            else {
                                $window.sessionStorage.setItem("CheckPreviousweek", "True");
                            }
                            modal.showUrl("EditTask.html#/?id=" + args.e.id());
                        }

                    }
                };

                $scope.showDay = function () {
                    $scope.dayConfig.visible = true;
                    $scope.weekConfig.visible = false;
                    $scope.navigatorConfig.selectMode = "day";
                };

                $scope.showWeek = function () {

                    $scope.dayConfig.visible = false;
                    $scope.weekConfig.visible = true;
                    $scope.navigatorConfig.selectMode = "week";
                };

                loadEvents();


                $http.get('/GetProjNameByUser/' + Mainusername + '/' + FacilityService).then(function (response) {
                    
                    $scope.ProjectNames = response.data;
                    if (editpage == "true") {
                        $scope.showActiveUser = true;

                    }
                    else {
                        $scope.showActiveUser = false;

                    }

                    $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
                        $scope.GetProjectDetails = response.data;
                        for (v = 0; v < 7; v++) {
                            checkpublished1($scope.getAllWeekDays[v]);
                        }
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

                });
            }
        };


        var myid = "";
        Tab = "TaskView";

        $http.get('/GetProjNameByUser/' + Mainusername + '/' + FacilityService).then(function (response) {


            $scope.ProjectNames = response.data;
            if (editpage == "true") {
                $scope.showActiveUser = true;

            }
            else {
                $scope.showActiveUser = false;

            }
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

        });

        $scope.showtimesheet = false;


        var parseTime = function (s) {
            var c = s.split(':');
            return parseInt(c[0]) * 60 + parseInt(c[1]);
        }



        var GetUserTimeSheet = function () {
            $http.get('/GetUserTimeSheet/' + Mainusername + '/' + FacilityService).then(function (response) {
                
                $scope.GetUserTimeSheet = response.data;

            });
        }
        GetUserTimeSheet();
        $http.get('/GetTaskTotHours/' + Mainusername + '/' + FacilityService).then(function (response) {

            $scope.getTaskTotalHours = response.data;

        });



        var ProjectID = "";
        var getProjectID = "";
        $scope.SelectStream1 = [];
        $scope.getalldates = [];
        $scope.CheckRecordPublish = [];
        var checkpublished = function (StartDate) {


            if (StartDate) {
                SelectStream1 = $filter('filter')($scope.TimeSheetdata, { StartDate: StartDate });

            }
        }


        var ActiveUser = function (response) {


            $http.get('/GetProjNameByUser/' + username + '/' + FacilityService).then(function (response) {

                $scope.ProjectNames = response.data;


            });
        }
        ActiveUser();
        var checkpublished1 = function (StartDate) {


            if (StartDate) {

                var year = StartDate.substring(0, 4);
                var month = StartDate.substring(5, 7);
                var date = StartDate.substring(8, 10);
                var fulldate = date + '-' + month + '-' + year;
                SelectStream1 = $filter('filter')($scope.GetUserTimeSheet, { StartDate: fulldate });

                if (SelectStream1.length == 0) {

                }
                else {

                    if (SelectStream1 != undefined) {

                        if (SelectStream1.length == 1) {
                            $scope.SelectStream1.push(SelectStream1[0]);
                            $scope.CheckRecordPublish.push(SelectStream1[0]);
                            $scope.TotHours += SelectStream1[0].Hours;


                        }
                        else {
                            for (i = 0; i < SelectStream1.length; i++) {
                                $scope.SelectStream1.push(SelectStream1[i]);
                                $scope.CheckRecordPublish.push(SelectStream1[0]);
                                $scope.TotHours += parseFloat(SelectStream1[i].Hours);

                            }
                        }

                    }

                }
            }
        }


        var checkpublished2 = function (StartDate) {


            if (StartDate) {

                var year = StartDate.substring(0, 4);
                var month = StartDate.substring(5, 7);
                var date = StartDate.substring(8, 10);
                var fulldate = date + '-' + month + '-' + year;
                SelectStream1 = $filter('filter')($scope.getTaskTotalHours, { PlanStartDate: fulldate });

                if (SelectStream1.length == 0) {

                }
                else {

                    if (SelectStream1 != undefined) {

                        if (SelectStream1.length == 1) {

                            $scope.TotHours += SelectStream1[0].Duration * 60;
                            $scope.CheckRecordPublish.push(SelectStream1[0]);

                        }
                        else {
                            for (i = 0; i < SelectStream1.length; i++) {

                                $scope.TotHours += parseFloat(SelectStream1[i].Duration * 60);
                                $scope.CheckRecordPublish.push(SelectStream1[0]);
                            }
                        }

                    }

                }
            }
        }

        $scope.Publish = function () {



            if ($scope.getAllWeekDays.length == 0) {
                $notify.warning('Warning', 'Get all the records');
                return true;
            }
            for (i = 0; i < $scope.getAllWeekDays.length - 1; i++) {

                $scope.CheckDailyTotHours = 0;
                $scope.TaskViewSelectStream = [];

                var CheckDailyStartDate = $scope.getAllWeekDays[i].split('-')[2] + '-' + $scope.getAllWeekDays[i].split('-')[1] + '-' + $scope.getAllWeekDays[i].split('-')[0];
                $scope.TaskViewSelectStream = $filter('filter')($scope.GetUserTimeSheet, { StartDate: CheckDailyStartDate });

                for (j = 0; j < $scope.TaskViewSelectStream.length; j++) {
                    $scope.CheckDailyTotHours = $scope.CheckDailyTotHours + parseFloat($scope.TaskViewSelectStream[j].Hours)

                }
                if (i != 0) {

                    if ($scope.CheckDailyTotHours < 480) {
                        $notify.warning('Warning', 'To publish the Timesheet it requires 40 hours task per week and each day must have minimum of 8 hours, Please enter all the tasks and then publish your Timesheet');
                        return true;
                    }
                }

            }


            count = 0;
            if (getProjectID == "") {
                $notify.warning('Warning', 'Please Select the Project');
                return true;
            }

            if ($scope.SelectStream1.length == 0) {
                $notify.warning('Warning', 'No records found');
                return true;
            }
            
            if ($scope.SelectStream1[0].Publish == 1) {
                $notify.warning('Warning', 'Timesheet already Published');
                return true;
            }

            var getAllWeekDaysStartDate = $scope.getAllWeekDays[0].split('-');

            if ($scope.CurrentWeekStartDate == $scope.getAllWeekDays[0]) {

            }
            else {
                // $notify.warning('Warning', 'Previous Week timesheet not able to publish');
                // return true;
            }
					var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date + ' ' + time;
            if (($scope.TotHours / 60) < 40) {
                $notify.warning('Warning', 'To publish the Timesheet it requires 40 hours task per week and each day must have minimum of 8 hours, Please enter all the tasks and then publish your Timesheet');
            }

            else {
                a = $scope.getAllWeekDays[0];
                for (i = 0; i < 7; i++) {
                    var publish = 1;
                    $http.put('/UpdatePublish', {
                        'StartDate': $scope.getAllWeekDays[i],
                        'Publish': publish,
                        'UpdatedOn':dateTime,
                        'UserName':Mainusername,
						'UpdatedbyID':Mainusername||""
                    }).then(function (response) {

                        $notify.success('success', 'TimeSheet Published successfully');
                        GetUserTimeSheet();
                        getTimeSheetrecords();
                    });
                }
                getTimeSheetrecords();

            }
        }
        $scope.getalldays = [];
        var Obj = {};
        var getTimeSheetrecords = function () {

            $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {

                
                $scope.events = [];
                if (viewtab = "TimeSheetView") {

                    if (response.data == 0) {
                        $scope.showtimesheet1 = true;
                        $scope.showtimesheet = false;
                        $scope.showtimesheet3 = false;
                    }
                    else {
                        $scope.showtimesheet1 = false;
                    }
                }
                $scope.TimeSheetdata = response.data;
                $scope.SelectStream1 = [];
                $scope.TotHours = 0;
                for (v = 0; v < 7; v++) {
                    checkpublished1($scope.getAllWeekDays[v]);
                }

                var data = response.data;

                if (data.length == 0)
                    return true;
                myid = data[0]._id;
                for (i = 0; i < data.length; i++) {

                    $scope.events.push({
                        id: data[i]._id,
                        text: data[i].Text,
                        start: data[i].Start,
                        end: data[i].End
                    });
                }
            });
        }
        var saveTimeSheetforloop1 = function (start, StartYear, OriginalStartmonth, SetStartEndDate, text, resource, Enddate, Startdate, OriginalEndDate, OriginalEndmonth, OriginalEndYear, phase) {

            var Startdate = parseInt(start.substring(8, 10));
            var Startmonth = parseInt(start.substring(5, 7));
            StartYear = parseInt(start.substring(0, 4));
            for (i = Startdate; i <= Enddate; i++) {
                var Obj = {};
                Obj.Start = start;
                Obj.End = SetStartEndDate;
                if (i == Startdate) {
                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }

                    var addStartDate = parseInt(Startdate) + 1;

                }
                else {

                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }
                    var addStartDate = parseInt(addStartDate) + 1;



                }


                if (addStartDate.toString().length == 1) {
                    var addStartDate = '0' + addStartDate;
                }
                if (Startmonth.toString().length == 1)
                    var Startmonth = '0' + Startmonth;
                var start = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "09:00:00";
                var SetStartEndDate = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "17:00:00";


            }
        }
        var StartYear = "";

        var getweekend = function (Startdate) {
            var splitdate = Startdate.split('T');
            var formatDate = splitdate[0].split('-');
            var date = new Date(formatDate[1] + '/' + formatDate[2] + '/' + formatDate[0]);
            var weekdays = new Array(7);
            weekdays[0] = "Sunday";
            weekdays[1] = "Monday";
            weekdays[2] = "Tuesday";
            weekdays[3] = "Wednesday";
            weekdays[4] = "Thursday";
            weekdays[5] = "Friday";
            weekdays[6] = "Saturday";
            return weekdays[date.getDay()];
        }
        var saveTimeSheetforloop2 = function (start, StartYear, OriginalStartmonth, SetStartEndDate, text, resource, Enddate, Startdate, OriginalEndDate, OriginalEndmonth, OriginalEndYear, phase) {

            var Startdate = parseInt(start.substring(8, 10));
            var Startmonth = parseInt(start.substring(5, 7));
            StartYear = parseInt(start.substring(0, 4));
            for (i = Startdate; i <= Enddate; i++) {
                if (i == 1) {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;
                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }
                    var addStartDate = parseInt(Startdate) + 1;
                }
                else if (i == Startdate) {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;





                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }

                    var addStartDate = parseInt(Startdate) + 1;
                    if (addStartDate > Enddate && Startmonth == OriginalEndmonth) { return true }
                    if (OriginalStartmonth <= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth = parseInt(Startmonth) + 1;
                            switch (Startmonth) {
                                case 1:
                                    var monthTotalDays = 31;
                                    if (StartYear <= OriginalEndYear) {
                                        StartYear = OriginalEndYear;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 2:
                                    if (OriginalEndYear % 4 == 0) {
                                        var monthTotalDays = 29;
                                    }
                                    else {
                                        var monthTotalDays = 28;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 3:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 4:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 5:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 6:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 7:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 8:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 9:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 10:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 11:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 12:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;

                            }


                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }
                    if (OriginalStartmonth >= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth1 = parseInt(Startmonth) + 1;
                            var Startmonth = Startmonth1 % 12;
                            switch (Startmonth) {
                                case 1:
                                    var monthTotalDays = 31;
                                    if (StartYear <= OriginalEndYear) {
                                        StartYear = OriginalEndYear;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 2:
                                    if (OriginalEndYear % 4 == 0) {
                                        var monthTotalDays = 29;
                                    }
                                    else {
                                        var monthTotalDays = 28;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 3:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 4:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 5:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 6:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 7:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 8:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 9:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 10:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 11:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 12:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;

                            }


                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }

                }
                else {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;

                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }
                    var addStartDate = parseInt(addStartDate) + 1;
                    if (addStartDate > Enddate && Startmonth == OriginalEndmonth) { return true }
                    if (OriginalStartmonth <= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth = parseInt(Startmonth) + 1;
                            switch (Startmonth) {
                                case 1:
                                    var monthTotalDays = 31;
                                    if (StartYear <= OriginalEndYear) {
                                        StartYear = OriginalEndYear;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 2:
                                    if (OriginalEndYear % 4 == 0) {
                                        var monthTotalDays = 29;
                                    }
                                    else {
                                        var monthTotalDays = 28;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 3:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 4:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 5:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 6:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 7:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 8:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 9:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 10:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 11:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 12:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        var Enddate = monthTotalDays;
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;

                            }

                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }
                    if (OriginalStartmonth >= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth1 = parseInt(Startmonth) + 1;
                            var Startmonth = Startmonth1 % 12;
                            switch (Startmonth) {
                                case 1:
                                    var monthTotalDays = 31;
                                    if (StartYear <= OriginalEndYear) {
                                        StartYear = OriginalEndYear;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 2:
                                    if (OriginalEndYear % 4 == 0) {
                                        var monthTotalDays = 29;
                                    }
                                    else {
                                        var monthTotalDays = 28;
                                    }
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 3:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 4:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 5:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 6:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 7:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 8:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 9:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 10:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 11:
                                    var monthTotalDays = 30;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;
                                case 12:
                                    var monthTotalDays = 31;
                                    if (Startmonth < OriginalEndmonth) {
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = monthTotalDays;
                                        }
                                    }
                                    else if (Startmonth == OriginalEndmonth) {
                                        var Enddate = OriginalEndDate;
                                    }
                                    break;

                            }


                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }
                }

                if (addStartDate.toString().length == 1) {
                    var addStartDate = '0' + addStartDate;
                }
                if (Startmonth.toString().length == 1)
                    var Startmonth = '0' + Startmonth;
                var start = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "09:00:00";
                var SetStartEndDate = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "17:00:00";


            }
        }

        var saveTimeSheetforloop = function (start, StartYear, OriginalStartmonth, SetStartEndDate, text, resource, Enddate, Startdate, OriginalEndDate, OriginalEndmonth, OriginalEndYear, phase) {

            var Startdate = parseInt(start.substring(8, 10));
            var Startmonth = parseInt(start.substring(5, 7));
            StartYear = parseInt(start.substring(0, 4));
            for (i = Startdate; i <= Enddate; i++) {
                if (i == 1) {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;

                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }
                    var addStartDate = parseInt(Startdate) + 1;
                }
                else if (i == Startdate) {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;

                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }

                    var addStartDate = parseInt(Startdate) + 1;
                    if (OriginalStartmonth <= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth1 = parseInt(Startmonth) + 1;
                            var Startmonth = Startmonth1 % 12;
                            if (Startdate == 1) {
                                switch (Startmonth) {
                                    case 1:
                                        var monthTotalDays = 31;
                                        if (StartYear <= OriginalEndYear) {
                                            StartYear = OriginalEndYear;
                                        }
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 2:
                                        if (OriginalEndYear % 4 == 0) {
                                            var monthTotalDays = 29;
                                        }
                                        else {
                                            var monthTotalDays = 28;
                                        }
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 3:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 4:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 5:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 6:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 7:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 8:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 9:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 10:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 11:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 12:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;

                                }
                            }
                            var Enddate = OriginalEndDate;
                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }

                }
                else {
                    var Obj = {};
                    Obj.Start = start;
                    Obj.End = SetStartEndDate;

                    var day = getweekend(start);
                    if (day != 'Sunday' && day != 'Saturday') { $scope.getalldays.push(Obj); }
                    var addStartDate = parseInt(addStartDate) + 1;
                    if (addStartDate > Enddate && StartYear == OriginalEndYear) {
                        return true;
                    }
                    if (OriginalStartmonth <= OriginalEndmonth) {
                        if (addStartDate > Enddate) {
                            var Startdate = 1;
                            var addStartDate = 1;
                            var Startmonth1 = parseInt(Startmonth) + 1;
                            var Startmonth = Startmonth1 % 12;
                            if (Startdate == 1) {
                                switch (Startmonth) {
                                    case 01:
                                        var monthTotalDays = 31;
                                        if (StartYear <= OriginalEndYear) {
                                            StartYear = OriginalEndYear;
                                            $scope.OriginalEndYear = OriginalEndYear;
                                        }
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 02:
                                        if (OriginalEndYear % 4 == 0) {
                                            var monthTotalDays = 29;
                                        }
                                        else {
                                            var monthTotalDays = 28;
                                        }
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 03:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 04:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 05:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 06:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 07:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 08:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 09:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 10:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 11:
                                        var monthTotalDays = 30;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;
                                    case 12:
                                        var monthTotalDays = 31;
                                        if (OriginalEndDate <= monthTotalDays) {
                                            var Enddate = OriginalEndDate;
                                        }
                                        break;

                                }
                            }
                            var Enddate = OriginalEndDate;
                            i = (0);
                            if (Startmonth.toString().length == 1)
                                var Startmonth = '0' + Startmonth;
                        }
                    }
                }

                if (addStartDate.toString().length == 1) {
                    var addStartDate = '0' + addStartDate;
                }
                if (Startmonth.toString().length == 1)
                    var Startmonth = '0' + Startmonth;
                var start = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "09:00:00";
                var SetStartEndDate = StartYear + '-' + Startmonth + '-' + addStartDate + 'T' + "17:00:00";


            }
        }


        var getcurrentweekdate = function () {
            if ($scope.getAllWeekDays.length == 0) {
                $scope.getAllWeekDays = [];

                Date.prototype.getWeek = function (start) {
                    //Calcing the starting point
                    start = start || 0;
                    var today = new Date(this.setHours(0, 0, 0, 0));
                    var day = today.getDay() - start;
                    var date = today.getDate() - day;

                    // Grabbing Start/End Dates
                    var StartDate = new Date(today.setDate(date));
                    var EndDate = new Date(today.setDate(date + 6));
                    return [StartDate, EndDate];


                }
                var curr = new Date; // get current date
                var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week 
                var last = first + 6; // last day is the first day + 6 
                firstday = new Date(curr.setDate(first));
                lastday = new Date(curr.setDate(curr.getDate() + 6));

                var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
                // test code
                var Dates = new Date().getWeek();
                var Mainstart = firstday.toLocaleDateString();
                var Mainend = lastday.toLocaleDateString();
                var start = Mainstart.split('/');
                var end = Mainend.split('/');
                var StartDate = start[1];
                var CheckCurrentWeekStartDate = start[1];
                ; if (start[1].length == 1) {
                    fullstartdate = 0 + start[1];
                }
                else {
                    fullstartdate = start[1];
                }
                $scope.CurrentWeekStartDate = start[2] + '-' + start[0] + '-' + fullstartdate;
                $scope.CurrentWeekStartDate1 = new Date(start[2], start[0], start[1]).toDateString();
                var Year = parseInt(start[2].replace(re, ''), 10);
                var StartYear = parseInt(start[2].replace(re, ''), 10);
                var Month = parseInt(start[0].replace(re, ''), 10);
                var Startmonth = parseInt(start[0].replace(re, ''), 10);
                var Date1 = parseInt(start[1].replace(re, ''), 10);
                var EndYear = parseInt(end[2].replace(re, ''), 10);
                var OriginalEndYear = parseInt(end[2].replace(re, ''), 10);
                var EndMonth = parseInt(end[0].replace(re, ''), 10);
                var OriginalEndmonth = parseInt(end[0].replace(re, ''), 10);
                var EndDate = parseInt(end[1].replace(re, ''), 10);
                var OriginalEndDate = parseInt(end[1].replace(re, ''), 10);
                var endloop = (Date1 + 6)

                getweekdays(start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)

            }
        }
        var loadTimeSeetData = function (args) {

            $scope.TotHours = 0;
            $scope.events = [];
            $scope.getalldays = [];
            $scope.showtimesheet1 = false
            var ProjectID = document.getElementById("ProjectNameID").value;
            getProjectID = ProjectID;
            if (ProjectID == "") {
                $scope.showtimesheet = false;

                return '';
            }
            else {
                $scope.showtimesheet = true;

            }
            if (TimeSheetView == 1) {

                viewtab = "TimeSheetView";
                count = 0;
                hours = 0;

                getcurrentweekdate();
                ProjectID = ProjectID;

                if (ProjectID == undefined) {
                    $scope.events = "";
                }

                if (ProjectID != undefined)
                    $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                        
                        $scope.events = [];
                        if (response.data == 0) {
                            $scope.showtimesheet1 = true;
                            $scope.showtimesheet = false;
                            $scope.showtimesheet3 = false;
                        }
                        else {
                            $scope.showtimesheet1 = false;
                        }

                        $scope.TimeSheetdata = response.data;

                        for (a = 0; a < $scope.getAllWeekDays.length; a++) {
                            if (a < 7) {
                                checkpublished1($scope.getAllWeekDays[a]);

                            }

                        }


                        var data = response.data;

                        if (data.length == 0)
                            return true;
                        myid = data[0]._id;
                        for (i = 0; i < data.length; i++) {

                            $scope.events.push({
                                id: data[i]._id,
                                text: data[i].Text,
                                start: data[i].Start,
                                end: data[i].End
                            });
                        }
                    });
            }
            else if (TaskView == 1) {

                getcurrentweekdate();

                viewtab = "TaskView";
                $http.get('/GetTaskGridValues1/' + Mainusername + '/' + ProjectID + '/' + FacilityService).then(function (response) {
                    $scope.TotHours = 0;
                    var data = response.data;
                    $scope.getTaskdata = response.data;


                    for (a = 0; a < $scope.getAllWeekDays.length; a++) {
                        if (a < 7) {
                            checkpublished1($scope.getAllWeekDays[a]);

                        }

                    }

                    if (data.length == 0)
                        return true;
                    myid = data[0]._id;
                    for (k = 0; k < data.length; k++) {

                        var PlanStartDate = data[k].PlanStartDate.split('-');
                        var PlanEndDate = data[k].PlanEndDate.split('-');


                        
                        var startDate = new Date(PlanStartDate[2] + "-" + PlanStartDate[1] + "-" + PlanStartDate[0]); //YYYY-MM-DD
                        var endDate = new Date(PlanEndDate[2] + "-" + PlanEndDate[1] + "-" + PlanEndDate[0]); //YYYY-MM-DD

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

                        for (d = 0; d < dateArr.length; d++) {

                            if(d==274){
                                
                              
                            }
                            var dateString = dateArr[d];
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

                            var Obj = {};

                            appDate = mo + '-' + day + '-' + yr;

                            Obj.Start = yr + '-' + mo + '-' + day + 'T' + "09:00:00";
                            Obj.End = yr + '-' + mo + '-' + day + 'T' + "17:00:00";
                            GetDay = dateArr[d].getDay()
                            if (GetDay == 6 || GetDay == 0) { }
                            else {
                                $scope.getalldays.push(Obj);
                            }
                        }





                        for (j = 0; j < $scope.getalldays.length; j++) {
                            hours = 40 / $scope.getalldays.length;

                        }








                        for (j = 0; j < $scope.getalldays.length; j++) {

                            var Startdate = $scope.getalldays[j].Start;

                            var EndDate = $scope.getalldays[j].End;

                            $scope.events.push({
                                id: data[k]._id,
                                text: data[k].TaskDescription,
                                start: Startdate,
                                end: EndDate
                            });




                        }
                        $scope.getalldays = [];
                        $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {




                            var maindata = response.data;

                            if (data.length == 0)
                                return true;


                        });




                    }
                });
            }

        }
        $scope.showtimesheet = false

        $scope.getuserProject = function () {
            
            $scope.showtimesheet1 = false;
            $scope.TotHours = 0;

            $scope.ProjectName = {};
            $scope.showtimesheet3 = false;

            $scope.showtimesheet = false;
            $scope.events = [];

            var GetUserName = document.getElementById("UserNameID").value;
            Mainusername = GetUserName;
            $scope.events = [];
            $http.get('/GetTaskTotHours/' + Mainusername + '/' + FacilityService).then(function (response) {

                $scope.getTaskTotalHours = response.data;

            });

            $http.get('/GetProjNameByUser/' + GetUserName + '/' + FacilityService).then(function (response) {

                $scope.ProjectNames = response.data;


            });
        }
        $scope.getProjectID = function () {
            
            $scope.TotHours = 0;
            var ProjectID = document.getElementById("ProjectNameID").value;
            getProjectID = ProjectID
            GetUserTimeSheet();
            $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                $scope.events = [];
                
                if (Tab == "TimeSheetView") {
                    if (response.data == 0) {
                        $scope.showtimesheet1 = true;
                        $scope.showtimesheet = false;
                    }
                    else {
                        $scope.showtimesheet1 = false;
                    }
                }
                for (v = 0; v < 7; v++) {
                    checkpublished1($scope.getAllWeekDays[v]);
                }
                $scope.TimeSheetdata = response.data;
                $scope.SelectStream1 = [];
                $scope.TotHours = 0;


                var data = response.data;

                if (data.length == 0)
                    return true;
                myid = data[0]._id;

            });
            if (ProjectID == "" || undefined) {
                $scope.TotHours = 0;
                $scope.showtimesheet2 = false;
                $scope.showtimesheet = false;
                $scope.showtimesheet1 = false;
                $scope.events = [];
                return true
            }
            $scope.showtimesheet2 = false;
            $scope.TotHours = 0;
            loadTimeSeetData();


        }
        var hours = 0;
        $scope.events = [];

        var editpage = sessionStorage.getItem("EditTimeSheet");


        var dismove = "";
        if (editpage == true) {

            dismove = "Update";
        }
        else {

            dismove = "Disabled";
        }
        var count = 0;
        var getweekdays = function (start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop) {

            switch (Month) {
                case 1:
                    var monthTotalDays = 31;
                    if (StartYear <= OriginalEndYear) {
                        StartYear = OriginalEndYear;
                    }
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 2:
                    if (OriginalEndYear % 4 == 0) {
                        var monthTotalDays = 29;
                    }
                    else {
                        var monthTotalDays = 28;
                    }
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 3:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 4:
                    var monthTotalDays = 30;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 5:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 6:
                    var monthTotalDays = 30;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 7:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 8:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 9:
                    var monthTotalDays = 30;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 10:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 11:
                    var monthTotalDays = 30;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;
                case 12:
                    var monthTotalDays = 31;
                    if (Startmonth < OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }
                    if (Startmonth > OriginalEndmonth) {
                        if (OriginalEndDate <= monthTotalDays) {
                            var Enddate = monthTotalDays;
                        }
                    }

                    break;

            }

            if (Year == EndYear && Month == EndMonth) {

                for (i = Date1; i <= endloop; i++) {

                    if (Month.toString().length == 1) { var month = '0' + Month; }
                    else { var month = Month; }
                    if (Date1.toString().length == 1)
                        var Date1 = '0' + Date1;
                    var fullDate = Year + '-' + month + '-' + Date1;
                    checkpublished(StartDate);
                    if ($scope.getAllWeekDays.length == 7) {
                        $scope.getAllWeekDays = [];
                    }
                    $scope.getAllWeekDays.push(fullDate);
                    Date1 = parseInt(Date1) + 1;

                }
            }
            else if (Year == EndYear && Month < EndMonth) {

                var item = 0;
                for (i = Date1; i <= Enddate; i++) {

                    if (Month.toString().length == 1) { var Month = '0' + Month; }



                    if (Date1.toString().length == 1)
                        var Date1 = '0' + Date1;
                    var fullDate = Year + '-' + Month + '-' + Date1;
                    if ($scope.getAllWeekDays.length == 7) {
                        return true
                        $scope.getAllWeekDays = [];
                    }
                    $scope.getAllWeekDays.push(fullDate);
                    Date1 = parseInt(Date1) + 1;
                    var convmonth = parseInt(Month);
                    if (item < 1) {
                        if (Date1 > Enddate) {
                            i = 0;
                            Date1 = 1;
                            Month = convmonth + 1;
                            item = item + 1;
                            Enddate = OriginalEndDate;
                        }
                    }

                }
            }
            else if (Year < EndYear && Month > EndMonth) {
                var item = 0;
                for (i = Date1; i <= Enddate; i++) {

                    if (Month.toString().length == 1) { var Month = '0' + Month; }




                    if (Date1.toString().length == 1)
                        var Date1 = '0' + Date1;
                    var fullDate = Year + '-' + Month + '-' + Date1;
                    if ($scope.getAllWeekDays.length == 7) {
                        $scope.getAllWeekDays = [];
                    }
                    $scope.getAllWeekDays.push(fullDate);
                    Date1 = parseInt(Date1) + 1;
                    var convmonth = parseInt(Month);
                    var convyear = parseInt(Year);
                    if (item < 1) {
                        if (Date1 > Enddate) {
                            i = 0;
                            Date1 = 1;
                            Month = convmonth + 1;
                            if (Month >= 13) {
                                Month = Month % 12;
                                if (Month.toString().length == 1) { var Month = '0' + Month; }
                            }
                            item = item + 1;
                            Year = convyear + 1;
                            Enddate = OriginalEndDate;
                        }
                    }

                }
            }
        }
        var GetTimesheet = function () {

            $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                $scope.events = [];

                $scope.TimeSheetdata = response.data;
                checkpublished(StartDate);

                var data = response.data;

                if (data.length == 0)
                    return true;
                myid = data[0]._id;
                for (i = 0; i < data.length; i++) {

                    $scope.events.push({


                        id: data[i]._id,
                        text: data[i].Text,
                        start: data[i].Start,
                        end: data[i].End
                    });
                    $scope.TotHours = 0;

                    getTimeSheetrecords();
                }
            });
        }
        $scope.getAllWeekDays = [];
        function loadEvents(args) {


            if (Tab == null) { Tab = "TimeSheetView" }
            if (Tab == "TimeSheetView") {
                if (getProjectID == "") {
                    Date.prototype.getWeek = function (start) {
                        //Calcing the starting point
                        start = start || 0;
                        var today = new Date(this.setHours(0, 0, 0, 0));
                        var day = today.getDay() - start;
                        var date = today.getDate() - day;

                        // Grabbing Start/End Dates
                        var StartDate = new Date(today.setDate(date));
                        var EndDate = new Date(today.setDate(date + 6));
                        return [StartDate, EndDate];
                    }

                    // test code
                    var Dates = new Date().getWeek();
                    var Mainstart = Dates[0].toLocaleDateString();
                    var Mainend = Dates[1].toLocaleDateString();
                    var start = Mainstart.split('/');
                    var end = Mainend.split('/');
                    var StartDate = start[1];
                    var Year = parseInt(start[2]);
                    var StartYear = parseInt(start[2]);
                    var Month = parseInt(start[0]);
                    var Startmonth = parseInt(start[0]);
                    var Date1 = parseInt(start[1]);
                    var EndYear = parseInt(end[2]);
                    var OriginalEndYear = parseInt(end[2]);
                    var EndMonth = parseInt(end[0]);
                    var OriginalEndmonth = parseInt(end[0]);
                    var EndDate = parseInt(end[1]);
                    var OriginalEndDate = parseInt(end[1]);
                    var endloop = (Date1 + 6)

                    getweekdays(start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)

                    return true
                }
                else {
                    $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                        $scope.events = [];

                        $scope.TimeSheetdata = response.data;
                        checkpublished(StartDate);

                        var data = response.data;

                        if (data.length == 0)
                            return true;
                        myid = data[0]._id;
                        for (i = 0; i < data.length; i++) {

                            $scope.events.push({


                                id: data[i]._id,
                                text: data[i].Text,
                                start: data[i].Start,
                                end: data[i].End
                            });
                            $scope.TotHours = 0;

                            getTimeSheetrecords();
                        }
                    });

                    var start = args.start;
                    var end = args.end;
                    if (start != undefined) {
                        var StartDate = start.toString().substring(0, 10);
                        var Year = parseInt(start.toString().substring(0, 4));
                        var StartYear = parseInt(start.toString().substring(0, 4));
                        var Month = parseInt(start.toString().substring(5, 7));
                        var Startmonth = parseInt(start.toString().substring(5, 7));
                        var Date1 = parseInt(start.toString().substring(8, 10));
                        var EndYear = parseInt(end.toString().substring(0, 4));
                        var OriginalEndYear = parseInt(end.toString().substring(0, 4));
                        var EndMonth = parseInt(end.toString().substring(5, 7));
                        var OriginalEndmonth = parseInt(end.toString().substring(5, 7));
                        var EndDate = parseInt(end.toString().substring(8, 10));
                        var OriginalEndDate = parseInt(end.toString().substring(8, 10));
                        var endloop = (Date1 + 6)

                        getweekdays(start, Date1, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)
                    }
                }

                $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                    $scope.events = [];

                    $scope.TimeSheetdata = response.data;
                    checkpublished(StartDate);

                    var data = response.data;

                    if (data.length == 0)
                        return true;
                    myid = data[0]._id;
                    for (i = 0; i < data.length; i++) {

                        $scope.events.push({


                            id: data[i]._id,
                            text: data[i].Text,
                            start: data[i].Start,
                            end: data[i].End
                        });
                        $scope.TotHours = 0;

                        getTimeSheetrecords();
                    }
                });

                if (args.start == undefined) {
                    return true
                }
                var start = args.start.toString();
                var end = args.end.toString();
                var StartDate = start.substring(0, 10);
                var Year = parseInt(start.substring(0, 4));
                var StartYear = parseInt(start.substring(0, 4));
                var Month = parseInt(start.substring(5, 7));
                var Startmonth = parseInt(start.substring(5, 7));
                var Date1 = parseInt(start.substring(8, 10));
                var EndYear = parseInt(end.substring(0, 4));
                var OriginalEndYear = parseInt(end.substring(0, 4));
                var EndMonth = parseInt(end.substring(5, 7));
                var OriginalEndmonth = parseInt(end.substring(5, 7));
                var EndDate = parseInt(end.substring(8, 10));
                var OriginalEndDate = parseInt(end.substring(8, 10));
                var endloop = (Date1 + 6)

                getweekdays(start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)

                count = 0;
                hours = 0;

                $scope.events = [];

                $http.get('/GetTimeSheet/' + Mainusername + '/' + FacilityService + '/' + getProjectID).then(function (response) {
                    
                    $scope.events = [];
                    var data = response.data;
                    $scope.TimeSheetdata = response.data;
                    if (data.length == 0)
                        return true;
                    myid = data[0]._id;

                    for (v = 0; v < 7; v++) {
                        checkpublished1($scope.getAllWeekDays[v]);
                    }
                    for (i = 0; i < data.length; i++) {

                        $scope.events.push({


                            id: data[i]._id,
                            text: data[i].Text,
                            start: data[i].Start,
                            end: data[i].End
                        });
                    }
                });


            }
            else {


                if (count == 0) {
                    loadTimeSeetData(args);

                    return
                }
                var start = args.start;
                var end = args.end;
                if (start == undefined) {

                }
                else {



                    var StartDate = start.toString().substring(0, 10);
                    var Year = parseInt(start.toString().substring(0, 4));
                    var StartYear = parseInt(start.toString().substring(0, 4));
                    var Month = parseInt(start.toString().substring(5, 7));
                    var Startmonth = parseInt(start.toString().substring(5, 7));
                    var Date1 = parseInt(start.toString().substring(8, 10));
                    var EndYear = parseInt(end.toString().substring(0, 4));
                    var OriginalEndYear = parseInt(end.toString().substring(0, 4));
                    var EndMonth = parseInt(end.toString().substring(5, 7));
                    var OriginalEndmonth = parseInt(end.toString().substring(5, 7));
                    var EndDate = parseInt(end.toString().substring(8, 10));
                    var OriginalEndDate = parseInt(end.toString().substring(8, 10));
                    var endloop = (Date1 + 6)

                    getweekdays(start, Date1, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)
                }
                loadTimeSeetData(args);

            }
            // using $timeout to make sure all changes are applied before reading visibleStart() and visibleEnd()
            $timeout(function () {
                var params = {
                    start: $scope.week.visibleStart().toString(),
                    end: $scope.week.visibleEnd().toString()
                };

            });
        }

        $scope.TaskView = function () {
            $scope.TotHours = 0;

            Tab = "TaskView";
            TimeSheetView = 0;
            TaskView = 1;
            $scope.ShowPublish = false;
            var ProjectID = document.getElementById("ProjectNameID").value;
            if (ProjectID == "" || undefined) {
                $scope.TotHours = 0;
                $scope.showtimesheet2 = true;
                $scope.showtimesheet = false;
                $scope.events = [];
                return true
            }
            $scope.showtimesheet2 = false;

            loadTimeSeetData();
            $http.get('/GetProjNameByUser/' + Mainusername + '/' + FacilityService).then(function (response) {




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

            });



            TaskView = 1;
            $scope.Viewbuscinesshours = true;

            TimeSheetView = 0;
            $scope.events = [];
        }
        $scope.Viewbuscinesshours = false;

        $scope.TimeSheetView = function () {

            $scope.TotHours = 0;
            $scope.ShowPublish = true;

            TimeSheetView = 1;
            Tab = "TimeSheetView";

            var ProjectID = document.getElementById("ProjectNameID").value;
            if (ProjectID == "" || undefined) {
                $scope.TotHours = 0;
                $scope.showtimesheet2 = true
                $scope.showtimesheet = false;
                $scope.events = [];
                return true
            }

            $scope.showtimesheet2 = false;
            $scope.Viewbuscinesshours = false;
            $scope.getalldates = [];
            TimeSheetView = 1;
            $scope.events = [];

            loadTimeSeetData();

        }
    }]);