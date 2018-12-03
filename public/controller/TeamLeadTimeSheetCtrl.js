
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

app.controller('TeamLeadTaskDetails', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


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


                // });
                $http.get('/GetProjUserName/' + FacilityService + '/' + ProjectID).then(function (response) {

                    $scope.GetUserNames = response.data;
                    $scope.GetUserNames.sort(function(a, b){
                        var nameA=a.TeamMemberUserID.toLowerCase(), nameB=b.TeamMemberUserID.toLowerCase()
                        if (nameA < nameB) //sort string ascending
                            return -1 
                        if (nameA > nameB)
                            return 1
                        return 0 //default return value (no sorting)
                    })
    
                });

            }
        });

        $scope.getAllWeekDays = [];
        $scope.getAllWeekDates = [];
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
        }



        var MainTabText = '';
        $scope.Grid1visile = true;


        // $http.get('/UserResource123/' + FacilityService).then(function (response) {

        //     $scope.GetUserNames = response.data;


        // });
        $http.get('/GetProjectDetails1/' + FacilityService).then(function (response) {
            $scope.GetProjectDetails = response.data;

            // $scope.showProjectName = function (id) {
            //     

            //     if ($scope.GetProjectDetails.length > 0) {
            //         var SelectStream1 = [];
            //         if (id) {
            //             SelectStream1 = $filter('filter')($scope.GetProjectDetails, { _id: id });
            //         }
            //         return SelectStream1.length ? SelectStream1[0].ProjectName : 'Select';
            //     }
            //     else {

            //     }


            // };
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
                });




            });
        }
        $scope.getuserProject = function () {

            getuserprojbyfacility();

        }
        $scope.TodateDisabled = true;
        $scope.FromDate = function () {

            $scope.ShowButton = false;
            $scope.ShowGrid = false;
            $scope.TotHours = 0;
            var GetUserName = document.getElementById("UserNameID").value;
            var ProjectName = document.getElementById("ProjectNameID").value;
            var AddStartDate = document.getElementById("AddStartDate").value;








            var curr = (AddStartDate.split('-')[1] + '-' + AddStartDate.split('-')[0] + '-' + AddStartDate.split('-')[2]); // get current date
            var NEWDATE = Date.parse(curr.replace('-', '/').replace('-', '/'));

            var myDate = new Date(NEWDATE);
            // now set it to UTC
            var myDateinUTC = Date.UTC(myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), myDate.getHours(), myDate.getMinutes(), myDate.getSeconds(), myDate.getMilliseconds());
            var myNewDate = new Date(myDateinUTC);



            if (!isNaN(NEWDATE)) {
                NEWDATE = new Date(NEWDATE);

            }



            var first = myDate.getDate() - myDate.getDay();
            // First day is the day of the month - the day of the week 

            var last = first + 6; // last day is the first day + 6 
            firstday = new Date(myDate.setDate(first + 1)).toLocaleDateString();
            lastday = new Date(myDate.setDate(myDate.getDate() + 4)).toLocaleDateString();



            $scope.firstDAY = firstday;


            var lastdate = lastday.split('/')[1] + '-' + lastday.split('/')[0] + '-' + lastday.split('/')[2];

            var firstdate = firstday.split('/')[1] + '-' + firstday.split('/')[0] + '-' + firstday.split('/')[2];
            document.getElementById("AddEndDate").value = lastdate;
            document.getElementById("AddStartDate").value = firstdate;

            if (GetUserName == "" || undefined) {
                $notify.warning('warning', "Please Select Resource Name");
                $scope.GetUserName.UserName = "";
                return true;
            }
            if (GetUserName != "" || undefined) {
                if (ProjectName == "" || undefined) {
                    $notify.warning('warning', "Please Select Project Name");
                    $scope.ProjectName.ProjectID = "";
                    return true;
                }

            }
            $scope.TodateDisabled = true;
            $scope.To = {};
            $scope.getAllWeekDays = [];
            $scope.getAllWeekDates = [];

        }


        $scope.CalcDuration = function (Duration11) {


            var Duration11 = document.getElementById('HoursID').value;
            if (Duration11 > 12) {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should be less than 12');
                return true;
            }
            else if (Duration11 == "") {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should  be greater than 0 - 12');
                return true;
            }
            $scope.disabled = false;
        }

        $scope.AddCalcDuration1 = function (Duration11) {


            var Duration11 = document.getElementById('AddHoursID').value;
            if (Duration11 > 12) {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should be less than 12');
                return true;
            }
            else if (Duration11 == "") {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should  be greater than 0 - 12');
                return true;
            }
            $scope.disabled = false;
        }


        $scope.AddMinutesID = function (Duration11) {

            var Duration11 = document.getElementById('AddMinutesID').value;
            if (Duration11 > 59) {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should be less than 59');
                return true;
            }
            else if (Duration11 == "") {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should  be greater than 0 - 59');

                return true;
            }
            $scope.disabled = false;
        }

        $scope.CalcDuration1 = function (Duration11) {

            var Duration11 = document.getElementById('MinutesID').value;
            if (Duration11 > 59) {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should be less than 59');
                return true;
            }
            else if (Duration11 == "") {
                $scope.disabled = true;
                $notify.warning('Warning', 'Duration should  be greater than 0 - 59');

                return true;
            }
            $scope.disabled = false;
        }
        $scope.ToDate = function (FromDate, ToDate) {

            var UserNameID = document.getElementById('UserNameID').value;
            var ProjectNameID = document.getElementById('ProjectNameID').value;
            var AddStartDate = document.getElementById('AddStartDate').value;

            if (UserNameID == "" || ProjectNameID == "" || AddStartDate == "") {
                $notify.warning('Warning', 'Please select all the mandatory fileds');

                return true;
            }
            getTaskName();
            $scope.ShowButton = false;
            $scope.ShowGrid = false;
            var ToDate = document.getElementById("AddEndDate").value;
            $scope.getAllWeekDays = [];
            $scope.getAllWeekDates = [];
            var start = FromDate.split('-');
            var end = ToDate.split('-');
            var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
            var StartDate = start[0];
            var Year = parseInt(start[2]);
            var StartYear = parseInt(start[2]);
            var Month = parseInt(start[1]);
            var Startmonth = parseInt(start[1]);
            var Date1 = parseInt(start[0]);
            var EndYear = parseInt(end[2].replace(re, ''), 10);
            var OriginalEndYear = parseInt(end[2].replace(re, ''), 10);
            var EndMonth = parseInt(end[1].replace(re, ''), 10);
            var OriginalEndmonth = parseInt(end[1].replace(re, ''), 10);
            var EndDate = parseInt(end[0].replace(re, ''), 10);
            var OriginalEndDate = parseInt(end[0].replace(re, ''), 10);
            var TotalFromDate = Startmonth + '/' + StartDate + '/' + StartYear;
            var TotalToDate = EndMonth + '/' + EndDate + '/' + EndYear;
            var date = new Date(TotalFromDate);
            var date2 = new Date(TotalToDate);
            if (date > date2) {
                $notify.warning('warning', "End Date must be greater than Start Date");
                $scope.ShowGrid = false;
                return true;
            }
            var date1 = new Date(TotalFromDate);
            var date2 = new Date(TotalToDate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            var endloop = (Date1 + diffDays)
            $scope.getallweeks = 0;
            getweekdays(start, end, StartDate, Year, StartYear, Month, Startmonth, Date1, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)
            var GetFirstDatelastdate = $scope.firstDAY.split('/')[1] + '-' + $scope.firstDAY.split('/')[0] + '-' + $scope.firstDAY.split('/')[2];
            var start1 = GetFirstDatelastdate.split('-');

            var StartDate1 = 0 + start1[0];
            var Year1 = parseInt(start1[2].replace(re, ''), 10);
            var StartYear1 = parseInt(start1[2].replace(re, ''), 10);
            var Month1 = parseInt(start1[1].replace(re, ''), 10);
            var Startmonth1 = parseInt(start1[1].replace(re, ''), 10);
            var Date11 = parseInt(start1[0].replace(re, ''), 10);
            $scope.getallweeks = 1;
            getweekdays(start1, end, StartDate1, Year1, StartYear1, Month1, Startmonth1, Date11, EndYear, OriginalEndYear, EndMonth, OriginalEndmonth, EndDate, OriginalEndDate, endloop)
            $scope.getallweeks = 0;


            GetUserName = document.getElementById("UserNameID").value;
            $scope.ShowButton = true;
            $http.get('/GetTeamLeadTimeSheetFull/' + GetUserName + '/' + FacilityService).then(function (response) {
                $scope.GetTeamLeadTimeSheetFull = response.data;
                $scope.TotHours = 0;
                for (i = 0; i < $scope.getAllWeekDates.length; i++) {
                    $scope.TaskViewSelectStream = [];
                    $scope.TaskViewSelectStream = $filter('filter')($scope.GetTeamLeadTimeSheetFull, { StartDate: $scope.getAllWeekDates[i] });

                    for (j = 0; j < $scope.TaskViewSelectStream.length; j++) {
                        $scope.TotHours = $scope.TotHours + parseFloat($scope.TaskViewSelectStream[j].Hours)
                    }


                }


            });

        }
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

                for (i = Date1; i <= OriginalEndDate; i++) {

                    if (Month.toString().length == 1) { var month = '0' + Month; }
                    else { var month = Month; }
                    if (Date1.toString().length == 1)
                        var Date1 = '0' + Date1;
                    var fullDate = Date1 + '-' + month + '-' + Year;

                    if ($scope.getallweeks == 0) {
                        $scope.getAllWeekDays.push(fullDate);
                    }
                    if ($scope.getallweeks == 1) {
                        $scope.getAllWeekDates.push(fullDate);
                    }
                    Date1 = parseInt(Date1) + 1;

                }
            }
            else if (Year == EndYear && Month < EndMonth) {
                var item = 0;
                for (i = Date1; i <= Enddate; i++) {

                    if (Month.toString().length == 1) { var Month = '0' + Month; }



                    if (Date1.toString().length == 1)
                        var Date1 = '0' + Date1;
                    var fullDate = Date1 + '-' + Month + '-' + Year;

                    if ($scope.getallweeks == 0) {
                        $scope.getAllWeekDays.push(fullDate);
                    }
                    if ($scope.getallweeks == 1) {
                        $scope.getAllWeekDates.push(fullDate);
                    }
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
                    var fullDate = Date1 + '-' + Month + '-' + Year;
                    if ($scope.getAllWeekDays.length == 7) {
                        $scope.getAllWeekDays = [];

                    }
                    if ($scope.getallweeks == 0) {
                        $scope.getAllWeekDays.push(fullDate);
                    }
                    if ($scope.getallweeks == 1) {
                        $scope.getAllWeekDates.push(fullDate);
                    }
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


        var getTaskName = function () {

            var a = document.getElementById("UserNameID");
            var UserName = a.options[a.selectedIndex].value;

            var b = document.getElementById("ProjectNameID");
            var ProjectNameID = b.options[b.selectedIndex].value;
            $http.get('/GetTaskGridValues1/' + UserName + '/' + ProjectNameID + '/' + FacilityService).then(function (response) {
                $scope.getallTaskName = response.data;
            });
        }




        $scope.getTimeSheetData = function (GetDate) {

            $scope.GetSelectedDate = GetDate;
            $scope.ShowGrid = true;
            var a = document.getElementById("UserNameID");
            var UserName = a.options[a.selectedIndex].value;
            GetUserName = a.options[a.selectedIndex].value;
            var b = document.getElementById("ProjectNameID");
            var ProjectNameID = b.options[b.selectedIndex].value;
            // var ProjID = $filter('filter')($scope.GetProjectDetails, { ProjectName: ProjectNameID });

            $http.get('/GetTeamLeadTimeSheet1/' + $scope.GetSelectedDate + '/' + UserName + '/' + FacilityService + '/' + ProjectNameID).then(function (response) {
                if (response.data.length == 0) {
                    //$http.get('/ViewManageTasks/' + FacilityService).then(function (response) {
                    //  $scope.GetWholeTaskDetails = response.data;
                    //  TaskViewSelectStream = [];
                    //  TaskViewSelectStream = $filter('filter')($scope.GetWholeTaskDetails, { ProjectID: ProjectNameID, TeamMemberUserID: UserName });
                    //  $scope.ChkViewManageTasks = TaskViewSelectStream;



                    //  var daterangecount = 0;
                    // $scope.ViewManageTasks = [];
                    // for (i = 0; i < $scope.ChkViewManageTasks.length; i++) {


                    //  daterangecount = 0;
                    // var dateFrom = $scope.ChkViewManageTasks[i].PlanStartDate;
                    // var ToDate = $scope.ChkViewManageTasks[i].PlanEndDate;

                    // var dateTo = ToDate;
                    // var dateCheck = GetDate;

                    //  var d1 = dateFrom.split('-');
                    // var d2 = dateTo.split('-');
                    // var c = dateCheck.split('-');

                    // var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
                    // var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
                    // var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);

                    // if (check >= from && check <= to) {
                    $scope.ViewManageTasks = "";
                    // }

                    // }

                    //});
                }
                else {

                    var array1 = response.data;
                    $scope.ViewManageTasks = [];
                    //   var array = [{"name":"Joe", "age":17}, {"name":"Bob", "age":17}, {"name":"Carl", "age": 35}];
                    array = _.chain(array1).map(function (item) { return item.TaskDescription }).uniq().value();

                    TaskID = _.chain(array1).map(function (item) { return item.TaskDescription && item.TaskID }).uniq().value();




                    for (i = 0; i < array.length; i++) {


                        var obj = {}
                        obj.TaskDescription = array[i]
                        obj._id = TaskID[i]

                        $scope.ViewManageTasks.push(obj);


                    }
                }



            });






        }


        $scope.showtaskDetails = function (id) {


            $scope.getplusid = id;

            $http.get('/GetTeamLeadTimeSheet/' + $scope.GetSelectedDate + '/' + id + '/' + FacilityService + '/' + document.getElementById("UserNameID").value).then(function (response) {
                $scope.GetTeamLeadTimeSheet = response.data;


                for (var i = 0; i < $scope.GetTeamLeadTimeSheet.length; i++) {
                    $scope.GetTeamLeadTimeSheet[i].expands = false;
                }
            });


        };


        $scope.EditTimeSheetClickClick = function (GetID) {

            $http.get('/GetTeamLeadTimeSheetEdit/' + GetID + '/' + FacilityService).then(function (response) {
                $scope.GetTeamLeadTimeSheetEdit = response.data;
                if ($scope.GetTeamLeadTimeSheetEdit[0].Publish == 1) {
                    $notify.warning('Warning', 'Timesheet alreay Published');
                    $('#UpdateModal').modal('hide');
                }
                else {
                    $('#UpdateModal').modal('show');
                }
                var Tasktype = $scope.GetTeamLeadTimeSheetEdit[0].TaskType;
                var Contain = $scope.GetTeamLeadTimeSheetEdit[0].Hours.toString().includes(".");
                if (Contain == false) {
                    $scope.TotalHours = Math.floor($scope.GetTeamLeadTimeSheetEdit[0].Hours);
                    $scope.TotalMints = 0;
                } else {
                    $scope.TotalHours = Math.floor($scope.GetTeamLeadTimeSheetEdit[0].Hours.toString().split(".")[0]);
                    $scope.TotalMints = 30;
                }


            });
        }

        $scope.showTLTSDetails = function () {
            for (var i = 0; i < $scope.ViewManageTasks.length; i++) {
                $scope.ViewManageTasks[i].expands = false;
            }
        };

        $scope.updateTeamLeadTimeSheet = function (UpdateTLID, Action) {


            if ($scope.ChkPublished == true) {
                $notify.warning('Warning', 'Timesheet alreay Published');
                return true
            }
            var EditIsActive = $scope.IsBillable;

            var GetPhase = document.getElementById("PhaseID").value;
            var GetItems = document.getElementById("ItemsID").value;
            var GetTaskType = document.getElementById("TaskTypeID").value;
            var GetComments = document.getElementById("CommentsID").value;
            var GetHours = document.getElementById("HoursID").value;
            var GetMinutes = document.getElementById("MinutesID").value;
            if (GetComments == undefined) {
                GetComments = "";
            }
            if (GetMinutes == 0) {
                addMints = 0.0;

            } else {
                addMints = 0.5;

            }
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            var BillingTypeValue = (parseInt(GetHours) + addMints)
            if (Action == "Update") {
                $http.put('/updateTeamLeadTimeSheet', {
                    'ID': UpdateTLID,
                    'phase': GetPhase,
                    'TaskType': GetTaskType,
                    'Items': GetItems,
                    'Comments': GetComments,
                    'Hours': BillingTypeValue,
                    'UpdatedByID': username,
                    'UpdatedOn': dateTime,
                    'IsBillable': EditIsActive,
                }).then(function (response) {
                    $notify.success('Success', 'Task Updated successfully');
                    refreshTable();

                });
            }
            else if (Action == "Add") {
                var GetPhase = document.getElementById("AddPhaseID").value;
                var GetItems = document.getElementById("AddItemsID").value;
                var GetTaskType = document.getElementById("AddTaskTypeID").value;
                var GetComments = document.getElementById("AddCommentsID").value;
                var GetHours = document.getElementById("AddHoursID").value;
                var GetMinutes = document.getElementById("AddMinutesID").value;
                var IsActive = $scope.IsBillable;



                var Projectid = $scope.AllProjects.filter(function (el) {
                    return el.ProjectName == document.getElementById("ProjectNameID").value
                })
                if (GetComments == undefined) {
                    GetComments = "";
                }
                if (GetMinutes == 0) {
                    addMints = 0.0;

                } else {
                    addMints = 0.5;

                }
                var BillingTypeValue = (parseInt(GetHours) + addMints)
                $http.post('/InsertTimeSheet1', {
                    'Text': "",
                    'Comments': GetComments,
                    'TaskType': GetTaskType,
                    'Items': GetItems,
                    'StartDate': $scope.GetSelectedDate,
                    'Start': $scope.GetSelectedDate,
                    'End': $scope.GetSelectedDate,
                    'ActualDate': $scope.GetSelectedDate,
                    'EndDate': $scope.GetSelectedDate,
                    'Hours': BillingTypeValue,
                    'phase': GetPhase,
                    'ProjectID': Projectid[0]._id,
                    'UserName': GetUserName,
                    'Publish': 0,
                    'FacilityID': FacilityService,
                    'TaskID': $scope.SetTaskID,
                    'TaskDescription': $scope.SetTaskDescription,
                    'IsBillable': IsActive,
                    'CreatedByID': username,
                    'UpdatedByID': username,
                    'CreatedOn': dateTime,
                    'UpdatedOn': dateTime

                }).then(function (response) {
                    $notify.success('Success', 'Task Created successfully');
                    document.getElementById("AddPhaseID").value = "";
                    document.getElementById("AddItemsID").value = "";
                    document.getElementById("AddTaskTypeID").value = "";
                    document.getElementById("AddCommentsID").value = "";
                    document.getElementById("AddHoursID").value = "";
                    document.getElementById("AddMinutesID").value = "";
                    refreshTable();
                })

            }
        }



        $http.get('/GetProjectDetails/' + FacilityService).then(function (response) {
            $scope.AllProjects = response.data;



        });
        var refreshTable = function () {
            $http.get('/GetTeamLeadTimeSheet/' + $scope.GetSelectedDate + '/' + $scope.getplusid + '/' + FacilityService).then(function (response) {
                $scope.GetTeamLeadTimeSheet = response.data;
                $http.get('/GetTeamLeadTimeSheetFull/' + GetUserName + '/' + FacilityService).then(function (response) {
                    $scope.GetTeamLeadTimeSheetFull = response.data;
                    $scope.TotHours = 0;
                    for (i = 0; i < $scope.getAllWeekDates.length; i++) {
                        $scope.TaskViewSelectStream = [];
                        $scope.TaskViewSelectStream = $filter('filter')($scope.GetTeamLeadTimeSheetFull, { StartDate: $scope.getAllWeekDates[i] });

                        for (j = 0; j < $scope.TaskViewSelectStream.length; j++) {
                            $scope.TotHours = $scope.TotHours + parseFloat($scope.TaskViewSelectStream[j].Hours)
                        }


                    }


                });


            });

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
        $http.get('/PMSConfig/TaskContent.json').success(function (data) {

            $scope.Phase = data.Phase;
            $scope.TaskType = data.TaskType;
            $scope.Item = data.Item;
            $scope.Type = data.Type;
        });
        $scope.getProjectID = function () {
            document.getElementById("AddStartDate").value = "";
            document.getElementById("AddEndDate").value = "";
            $scope.From = {};
            ProjectID = document.getElementById("ProjectNameID").value;
            $scope.ShowGrid = false;
            $scope.ShowButton = false;
            debugger
            $http.get('/GetProjUserName/' + FacilityService + '/' + ProjectID).then(function (response) {

                $scope.GetUserNames = response.data;
                $scope.GetUserNames.sort(function(a, b){
                    var nameA=a.TeamMemberUserID.toLowerCase(), nameB=b.TeamMemberUserID.toLowerCase()
                    if (nameA < nameB) //sort string ascending
                        return -1 
                    if (nameA > nameB)
                        return 1
                    return 0 //default return value (no sorting)
                })

            });
        }

        $scope.Publish = function () {



            $http.get('/GetTeamLeadTimeSheetFull/' + GetUserName + '/' + FacilityService).then(function (response) {
                $scope.GetTeamLeadTimeSheetFull = response.data;
                if ($scope.getAllWeekDates.length == 0) {
                    $notify.warning('Warning', 'Get the user Records first');
                    return true;
                }
                for (i = 0; i < $scope.getAllWeekDates.length; i++) {

                    $scope.CheckDailyTotHours = 0;
                    $scope.TaskViewSelectStream = [];
                    $scope.TaskViewSelectStream = $filter('filter')($scope.GetTeamLeadTimeSheetFull, { StartDate: $scope.getAllWeekDates[i] });

                    for (j = 0; j < $scope.TaskViewSelectStream.length; j++) {
                        $scope.CheckDailyTotHours = $scope.CheckDailyTotHours + parseFloat($scope.TaskViewSelectStream[j].Hours)
                        if ($scope.TaskViewSelectStream[j].Publish == 1) {
                            $notify.warning('Warning', 'Timesheet alreay Published');
                            return true;
                        }
                    }
                    if (i != 0) {

                        if ($scope.CheckDailyTotHours < 8) {
                            $notify.warning('Warning', 'To publish the Timesheet it requires 40 hours task per week and each day must have minimum of 8 hours, Please enter all the tasks and then publish your Timesheet');
                            return true;
                        }
                    }

                }
                if (($scope.TotHours) < 40) {
                    $notify.warning('Warning', 'To publish the Timesheet it requires 40 hours task per week and each day must have minimum of 8 hours, Please enter all the tasks and then publish your Timesheet');
                    return true;
                }

                else if (($scope.TotHours) > 39) {
                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var PublishedTime = date + ' ' + time;

                    for (i = 0; i < $scope.getAllWeekDates.length; i++) {
                        var publish = 1;

                        $http.put('/UpdateTeamLeadTimeSheetPublish', {
                            'StartDate': $scope.getAllWeekDates[i],
                            'Publish': publish,
                            'UserName': GetUserName,
                            'PublishedTime': PublishedTime
                        }).then(function (response) {

                            $notify.success('success', 'TimeSheet Published successfully');

                        });
                    }


                }


            });



        }

        $scope.AddTask = function (GetID, GetTaskDescription) {


            var Date1 = document.getElementById("AddStartDate").value;
            $http.get('/GetTeamLeadTimeSheetFullAdd/' + GetUserName + '/' + FacilityService + '/' + Date1).then(function (response) {
                $scope.GetTeamLeadTimeSheetEdit = response.data;
                if ($scope.GetTeamLeadTimeSheetEdit.length == 0) {
                    $('#AddModal').modal('show');
                    return;
                }
                if ($scope.GetTeamLeadTimeSheetEdit[0].Publish == 1) {
                    $notify.warning('Warning', 'Timesheet alreay Published');
                    $('#AddModal').modal('hide');
                }
                else {
                    $('#AddModal').modal('show');
                }


            });
            $scope.SetTaskID = GetID;
            $scope.SetTaskDescription = GetTaskDescription;
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


    }]);


