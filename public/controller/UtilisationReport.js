


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

app.controller('UtilisationReport', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
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
                    var access = $scope.role[0].UIList[13].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }

        $scope.Export = function (data) {
            
           
          

            if ($scope.BillableDetails.length > 0)
                alasql('SELECT * INTO XLSX("TimeSheet Report.xlsx",{sheetid: "Report",headers:true}) FROM ?', [$scope.BillableDetails]);
            else
                $notify.warning('Warning', 'No Data Found');
        }

        $scope.ExportBillable = function (data) {

            // var blob = new Blob([document.getElementById(data).innerHTML], {
            //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"

            // });

            // var date = new Date();
            // $scope.CurrentDate = $filter('date')(new Date(), 'dd/MM/yyyy');
            // var filename = "TimeSheetReport" + ".xls";
            // saveAs(blob, filename);
           

            if ($scope.UserReports.length > 0)
                alasql('SELECT * INTO XLSX("TimeSheet Report.xlsx",{sheetid: "Report",headers:true}) FROM ?', [$scope.UserReports]);
            else
                $notify.warning('Warning', 'No Data Found');
        }
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {

            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;

            $scope.ItemsPerPageCounts1 = data.ItemPerPage;
            $scope.ItemsPerPageCount1 = $scope.ItemsPerPageCounts1[0].PageID;
        });
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

        $scope.ToDate = function () {



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

        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;


        });
        $scope.Go = function () {
            
            $scope.UserReports = [];
            ReportType = document.getElementById("Report").value
            if (ReportType == "" || ReportType == undefined) {
                $notify.warning('warning', "Please Select the Report Type");
                return true;
            }
            var Startdate = document.getElementById("AddStartDate").value;
            if (Startdate == "" || Startdate == undefined) {
                $notify.warning('warning', "Please Select the From date");
                return true;
            }
            var Enddate = document.getElementById("AddEndDate").value;
            if (Enddate == "" || Enddate == undefined) {
                $notify.warning('warning', "Please Select the To date");
                return true;
            }
            $http.get('/BillableUser').then(function (response) {

                $scope.BillableUserList = response.data;

            });
            $scope.getAllDates = [];
            $scope.getAllDate = [];
            startDate = document.getElementById("AddStartDate").value;
            endDate = document.getElementById("AddEndDate").value;
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

            if (ReportType == 'TimeSheet') {
                $http.get('/GetBillableTimeSheet').then(function (response) {

                    $scope.TimeSheetReports = response.data;

                    for (i = 0; i < $scope.BillableUserList.length; i++) {
                        var obj = {};
                        TotBillablehours = 0;
                        TotNonBillablehours = 0;
                        for (z = 0; z < $scope.getAllDate.length; z++) {
                            GetUserBillableList = $scope.TimeSheetReports.filter(function (el) {
                                return el.UserName == $scope.BillableUserList[i].UserName && el.IsBillable == true && el.StartDate == $scope.getAllDate[z];
                            })
                            GetUserNonBillableList = $scope.TimeSheetReports.filter(function (el) {
                                return el.UserName == $scope.BillableUserList[i].UserName && el.IsBillable == false && el.StartDate == $scope.getAllDate[z];
                            })


                            if (GetUserBillableList.length > 0) {
                                for (a = 0; a < GetUserBillableList.length; a++) {
                                    TotBillablehours += GetUserBillableList[a].Hours;
                                }
                            }
                            else {
                                TotBillablehours += 0;
                            }

                            if (GetUserNonBillableList.length > 0) {
                                for (b = 0; b < GetUserNonBillableList.length; b++) {
                                    TotNonBillablehours += GetUserNonBillableList[b].Hours
                                }
                            }
                            else {
                                TotNonBillablehours += 0
                            }

                        }
                        obj.UserName = $scope.BillableUserList[i].UserName;
                        obj.BillableHours = TotBillablehours;
                        obj.NonBillableHours = TotNonBillablehours;
                        $scope.UserReports.push(obj);
                    }

                });
            }
            else {
                $http.get('/GetBillableTeamLeadTimeSheet').then(function (response) {

                    $scope.TimeSheetReports = response.data;

                    for (i = 0; i < $scope.BillableUserList.length; i++) {
                        var obj = {};
                        TotBillablehours = 0;
                        TotNonBillablehours = 0;
                        for (z = 0; z < $scope.getAllDate.length; z++) {
                            GetUserBillableList = $scope.TimeSheetReports.filter(function (el) {
                                return el.UserName == $scope.BillableUserList[i].UserName && el.IsBillable == true && el.StartDate == $scope.getAllDate[z];
                            })
                            GetUserNonBillableList = $scope.TimeSheetReports.filter(function (el) {
                                return el.UserName == $scope.BillableUserList[i].UserName && el.IsBillable == false && el.StartDate == $scope.getAllDate[z];
                            })


                            if (GetUserBillableList.length > 0) {
                                for (a = 0; a < GetUserBillableList.length; a++) {
                                    TotBillablehours += GetUserBillableList[a].Hours;
                                }
                            }
                            else {
                                TotBillablehours += 0;
                            }

                            if (GetUserNonBillableList.length > 0) {
                                for (b = 0; b < GetUserNonBillableList.length; b++) {
                                    TotNonBillablehours += GetUserNonBillableList[b].Hours
                                }
                            }
                            else {
                                TotNonBillablehours += 0
                            }

                        }
                        obj.UserName = $scope.BillableUserList[i].UserName;
                        obj.BillableHours = TotBillablehours;
                        obj.NonBillableHours = TotNonBillablehours;
                        $scope.UserReports.push(obj);
                    }

                });
            }
        }
        $scope.UserReports = [];
        var refresh = function () {


            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }

            else {
                $scope.ShowBody = true;
                $scope.Showmessage = false;
            }
        };
        $scope.ClearGrid = function () {
            $scope.UserReports = [];
        }
        $scope.GetClickUserName = function (UserName, billable) {
            
            $scope.SelectedUserName = UserName;
            $scope.billable = billable;
            $scope.BillableDetails = [];

            $http.get('/GetProjNameByUser/' + UserName + '/' + FacilityService).then(function (response) {

                $scope.ProjectNames = response.data;

                $scope.ProjName = []

                $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
                    $scope.GetProjectDetails = response.data;
                    for (a = 0; a < $scope.ProjectNames.length; a++) {


                        if ($scope.ProjectNames.length > 0) {
                            var SelectStream1 = [];
                            if ($scope.ProjectNames[a].ProjectID) {
                                SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: $scope.ProjectNames[a].ProjectID });
                            }
                            $scope.ProjName.push(SelectStream1.length ? SelectStream1[0].ProjectName : 'Select');
                        }
                        else {

                        }



                    }


                    $scope.ProjectNames = $scope.ProjName.sort();

                    

                    for (i = 0; i < $scope.ProjectNames.length; i++) {
                        ProjID = $scope.GetProjectDetails.filter(function (el) {
                            return el.ProjectName == $scope.ProjectNames[i]
                        })


                       
                        Tothours = 0;

                        for (z = 0; z < $scope.getAllDate.length; z++) {
                            GetUserBillableList = $scope.TimeSheetReports.filter(function (el) {
                                return el.ProjectID == ProjID[0]._id && el.IsBillable == $scope.billable && el.StartDate == $scope.getAllDate[z] && el.UserName == $scope.SelectedUserName;
                            })



                            if (GetUserBillableList.length > 0) {
                                for (a = 0; a < GetUserBillableList.length; a++) {
                                    var obj = {};
                                    obj.ProjectName = $scope.ProjectNames[i];
                                    
                                    obj.Task= GetUserBillableList[a].Text;
                                    obj.Date= GetUserBillableList[a].EndDate;
                                    obj.Comments= GetUserBillableList[a].Comments;
                                    obj.Hours= GetUserBillableList[a].Hours;
                                    $scope.BillableDetails.push(obj);
                                }
                            }
                            else {
                                
                            }



                        }
                     
                      

                    }


                });




            });
        }

        $scope.ClearToDate=function(){
            document.getElementById("AddEndDate").value="";
            
        }
    }]);