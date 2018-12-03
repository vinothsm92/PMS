


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

app.controller('MarginReportTemplate', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
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
            debugger



            if ($scope.BillableDetails.length > 0)
                alasql('SELECT * INTO XLSX("TimeSheet Report.xlsx",{sheetid: "Report",headers:true}) FROM ?', [$scope.BillableDetails]);
            else
                $notify.warning('Warning', 'No Data Found');
        }

        $scope.ExportBillable = function (data) {



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
        $http.get('/Manage_Usershow1').then(function (response) {

            $scope.GetUsersDetails = response.data;

            $scope.GetuserRole = $scope.GetUsersDetails.filter(function (el) {
                return el.UserName == username;
            })
            $scope.Role = false;
            if ($scope.GetuserRole[0].Role == '59240ca091c11112f42ec22f') { //Admin
                $http.get('/GetProj/' + FacilityService).then(function (response) {

                    $scope.ProjectNames = response.data;


                });
            }

            else if ($scope.GetuserRole[0].Role == '5ad59af3fd471db415f8d5f1') { //TeamLead
                $scope.Projectdata = [];
                $http.get('/GetTeamLeadProjectProj/' + username).then(function (response) {
                    $scope.ProjectNames = response.data;

                });


            }
        });
        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;


        });
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

        $scope.Go = function () {
            debugger
            $scope.UserReports = [];
            ProjectNameID = document.getElementById("ProjectNameID").value;
            if (ProjectNameID == "" || ProjectNameID == undefined) {
                $notify.warning('warning', "Please Select the Project Name");
                return true;
            }

            $scope.AddStartDate = document.getElementById("AddStartDate").value;
            $scope.AddEndDate = document.getElementById("AddEndDate").value;
            if ($scope.AddStartDate == "" || $scope.AddStartDate == undefined) { }
            else {
                if ($scope.AddEndDate == "" || $scope.AddEndDate == undefined) {
                    $notify.warning('warning', "Please Select the End Date");
                    return true
                }
            }

            $http.get('/GetMarginReportData').then(function (response) {

                $scope.GetProjectDetailsReport = response.data;
                $scope.GetProjectDetailsReport= $scope.GetProjectDetailsReport.filter(function(el){
                    return el.ProjectName==ProjectNameID;
                })
                if ($scope.AddStartDate != "" || $scope.AddStartDate == undefined) {
                    $scope.GetProjectDetailsReport = [];
                    $scope.FilterDate = response.data;

                    var c = $scope.AddStartDate.split("-");
                    var d = $scope.AddEndDate.split("-");
                    var from_date = c[2] + '-' + c[1] + '-' + c[0];
                    var to_date = d[2] + '-' + d[1] + '-' + d[0];

                    var listDate = [];
                    var startDate = from_date;
                    var endDate = to_date;
                    var dateMove = new Date(startDate);
                    var strDate = startDate;

                    while (strDate < endDate) {
                        var strDate = dateMove.toISOString().slice(0, 10);
                        listDate.push(strDate);
                        dateMove.setDate(dateMove.getDate() + 1);
                    };




                    for (j = 0; j < $scope.FilterDate.length; j++) {
                        var dateFrom = $scope.FilterDate[j].StartDate;
                        var dateTo = $scope.FilterDate[j].EndDate;




                        var dateCheck = $scope.AddStartDate;

                        var d1 = dateFrom.split("-");
                        var d2 = dateTo.split("-");

                        var c = dateCheck.split("-");

                        var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
                        var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
                        for (a = 0; a < listDate.length; a++) {
                            var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
                            var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);

                            var check = new Date(listDate[a]);




                            if (check >= from && check <= to) {
                                if ($scope.GetProjectDetailsReport.length == 0) {
                                    $scope.GetProjectDetailsReport.push($scope.FilterDate[j]);
                                } else {
                                    if ($scope.FilterDate[j].week == $scope.GetProjectDetailsReport[$scope.GetProjectDetailsReport.length - 1].week) {

                                    } else {

                                        $scope.GetProjectDetailsReport.push($scope.FilterDate[j]);
                                    }
                                }
                            }
                        }
                        var skillsSelect = document.getElementById("ProjectNameID");
                        var selectedText = skillsSelect.options[skillsSelect.selectedIndex].text;
                        $scope.filterMarginreport=$scope.GetProjectDetailsReport.filter(function (el) {
                            return el.ProjectName == selectedText;
                        })

                    }
                }

            });



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




        $scope.GetClickUserName = function (StartDate, EndDate, week) {
            debugger
            $scope.weekno = week;
            $scope.MarginReport = [];
            $('#Div1').modal('show');
            var c = StartDate.split("-");
            var d = EndDate.split("-");
            var from_date = c[2] + '-' + c[1] + '-' + c[0];
            var to_date = d[2] + '-' + d[1] + '-' + d[0];

            var Dates = [];
            var startDate = from_date;
            var endDate = to_date;
            var dateMove = new Date(startDate);
            var strDate = startDate;

            while (strDate < endDate) {
                var strDate = dateMove.toISOString().slice(0, 10);
                Dates.push(strDate);
                dateMove.setDate(dateMove.getDate() + 1);
            };


            Id = document.getElementById("ProjectNameID").value;

            $http.get('/GetAllCost/').then(function (response) {
                $scope.GetAllCost = response.data;


            });
            $http.get('/GetTaskBasedProjDetails1/' + Id).then(function (response) {
                $scope.GetTaskBasedProjDetails = response.data;


            });
            $http.get('/GetProjectTeamMembers1/' + Id).then(function (response) {
                $scope.GetProjectTeamMembers = response.data;

            });
            $http.get('/GetTeamLeadTSDetails1/' + Id).then(function (response) {
                $scope.GetTeamLeadTSDetails = response.data;


                var TaskDetails = $scope.GetTaskBasedProjDetails
                var TeamLeadTSDetails = response.data;
                var ProjectTeamMembers = $scope.GetProjectTeamMembers

                //  var GetLoadedCostCalc = 
                
                for (q = 0; q < ProjectTeamMembers.length; q++) {
                    TeamMember = ProjectTeamMembers[q].TeamMemberUserID;
                    TaskDetails = $scope.GetTaskBasedProjDetails.filter(function (el) {
                        return el.TeamMemberUserID == TeamMember;
                    })
                    if (TaskDetails.length > 0) {
                        var Hours = 0;
                        var PlannedCost = 0;
                        var actCost = 0;
                        for (j = 0; j < TaskDetails.length; j++) {
                            
                            for (k = 0; k < 7; k++) {
                                Dates[k];

                                var dateFrom = TaskDetails[j].PlanStartDate;
                                var dateTo = TaskDetails[j].PlanEndDate;




                                var dateCheck = Dates[k];

                                var d1 = dateFrom.split("-");
                                var d2 = dateTo.split("-");

                                var c = dateCheck.split("-");

                                var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
                                var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);

                                var check = new Date(c[0], parseInt(c[1]) - 1, c[2]);


                                if (check >= from && check <= to) {
                                    MonthName = monthNames[check.getMonth()];

                                    UserName = TaskDetails[j].TeamMemberUserID;
                                    
                                    HRBillable = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'HRB' && el.Month == MonthName && el.UserName == UserName && el.Year == c[0]
                                    })
                                    HRNONBillable = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'HRNB' && el.Month == MonthName && el.UserName == UserName && el.Year == c[0]
                                    })


                                    NonHR = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'NHR' && el.Month == MonthName && el.UserName == UserName && el.Year == c[0]
                                    })

                                    HRBillableForMonth = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'HRB' && el.Month == MonthName && el.Year == c[0]
                                    })

                                    Array.prototype.sum = function (prop) {
                                        var total = 0
                                        for ( var i = 0, _len = this.length; i < _len; i++ ) {
                                            total += this[i][prop]
                                        }
                                        return total
                                    }
                                    
                                    HRBillableForMonth=(HRBillableForMonth.sum("Amount"))
                                    HRNONBillableForMonth  = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'HRNB' && el.Month == MonthName && el.Year == c[0]
                                    })


                                    HRNONBillableForMonth=(HRNONBillableForMonth.sum("Amount"))
                                    NonHRForMonth  = $scope.GetAllCost.filter(function (el) {
                                        return el.ResourceType == 'NHR' && el.Month == MonthName && el.Year == c[0]
                                    })

                                    NonHRForMonth=(NonHRForMonth.sum("Amount"))

                                    Amount = HRBillable[0].Amount;

                                    if (HRBillableForMonth.length == 0) {
                                        HRBillableCost = 0;
                                    }
                                    else {
                                        HRBillableCost = HRBillableForMonth;

                                    }

                                    if (HRNONBillableForMonth.length == 0) {
                                        HRNONBillableCost = 0;
                                    }
                                    else {
                                        HRNONBillableCost = HRNONBillableForMonth;

                                    }

                                    if (NonHRForMonth.length == 0) {
                                        NonHRCost = 0;

                                    }
                                    else {
                                        NonHRCost = NonHRForMonth;

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
                                    oneDayHour = TaskDetails[j].Duration / BetweenDates.length;

                                    Hours += TaskDetails[j].Duration / BetweenDates.length;
                                    PlannedCost += (oneDayHour * PerHourCost);

                                }



                            }






                        }
                        actHours = 0;
                        TeamLeadTSDetails= response.data.filter(function (el) {
                            return el.UserName == TeamMember;
                        })
                        for (j = 0; j < TeamLeadTSDetails.length; j++) {
                            
                            for (k = 0; k < 6; k++) {
                                Dates[k];



                                var actdateFrom = TeamLeadTSDetails[j].EndDate;
                                var actdateTo = TeamLeadTSDetails[j].EndDate;

                                var dateCheck = Dates[k];


                                var actd1 = actdateFrom.split("-");
                                var actd2 = actdateTo.split("-");
                                var c = dateCheck.split("-");


                                var actfrom = new Date(actd1[2], parseInt(actd1[1]) - 1, actd1[0]);  // -1 because months are from 0 to 11
                                var actto = new Date(actd2[0], parseInt(actd2[1]) - 1, actd2[2]);
                                var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);



                                if (dateCheck == actdateFrom) {
                                    MonthName = monthNames[check.getMonth()];

                                       
                                    
                                    
                                 
                                        total = HRBillableCost + HRNONBillableCost + NonHRCost;
                                        loadedCost = total / HRBillableCost;

                                  








                                    PerHourCost = (Amount * loadedCost / 160);

                                    var From = new Date(d1[2] + '-' + (d1[1]) + '-' + d1[0]);
                                    var To = new Date(d2[2] + '-' + (d2[1]) + '-' + d2[0]);
                                    var BetweenDates = getDateArray((From), (To));
                                    oneDayHour = TeamLeadTSDetails[j].Hours;


                                    actCost += (oneDayHour * PerHourCost);
                                    actHours += TeamLeadTSDetails[j].Hours;

                                }

                            }
                           





                        }
                        if (Hours > 0) {
                            var obj = {};
                            obj.UserName = TeamMember;
                           
                            obj.StartDate = Dates[0];
                            obj.EndDate = Dates[6];

                            obj.PlannedEfforts = Hours;
                            obj.PlannedRevenue = PlannedCost;
                            obj.ActualEfforts = actHours;
                            obj.ActualRevenue = actCost;
                            $scope.MarginReport.push(obj);
                        }



                    }
                }
            });




        }
        var getDateArray = function (start, end) {
            var arr = new Array();
            var dt = new Date(start);
            while (dt <= end) {
                arr.push(new Date(dt));
                dt.setDate(dt.getDate() + 1);
            }
            return arr;
        }
        $scope.ClearToDate = function () {
            document.getElementById("AddEndDate").value = "";

        }
    }]);