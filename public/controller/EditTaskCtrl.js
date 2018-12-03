
var app = angular.module('main', ['ngCookies', "ngNotify"]);

app.controller('EditCtrl', ['$scope', '$http', '$window', '$filter', '$notify',
    '$location', '$cookieStore', '$timeout',
    function ($scope, $http, $window, $filter, $notify, $location, $cookieStore, $timeout) {
          

     

        var GetEventID1 = sessionStorage.getItem("gettaskid");

        var SelectedDate = sessionStorage.getItem("GetCurrentDate");
        $scope.SelectedDate = SelectedDate.substring(0, 10)


        var EventID = GetEventID1.split(",");

        var GetEventID = EventID[0];
        var GetTimeSheeetID = EventID[1];
        var TimeSheetid = sessionStorage.getItem("TimeSheetid");
        var UserName = sessionStorage.getItem("UserName");
        var FacilityService = sessionStorage.getItem("FacilityID");

        var Tab = sessionStorage.getItem("Tab");




        $http.get('/GetTaskEvent/' + GetEventID).then(function (response) {
              
            $scope.Comments = true;
            $scope.Items = false;
            $scope.Start = true;
            $scope.End = true;


            $scope.data = response.data;
            var getProjectID = $scope.data[0].ProjectID;
            $http.get('/GetTimeSheet/' + UserName + '/' + FacilityService + '/' + getProjectID).then(function (response) {



                $scope.TimeSheetdata = response.data;

            });
            var Tasktype = $scope.data[0].IsBillable;
            if (Tasktype == "Yes") {
                $scope.Tasktype = "Bill"
            }
            else {
                $scope.Tasktype = "Non-Bill"
            }


        });

        $scope.events = [];

        $scope.delete = function () {
          
        };
        $scope.save = function () {
              
            var Activity = document.getElementById("name1").value;
            var CurrentDate = document.getElementById("CurrentDate").value;
            var Comments = document.getElementById("CommentsID").value;
            var TaskType = document.getElementById("TaskTypeID").value;
            var Items = document.getElementById("ItemsID").value;
            var Duration = document.getElementById("Duration").value;

            if (Activity == "" || TaskType == "" || Items == "" || Duration == "" || Comments == "") {
               
                $notify.warning('Warning', 'Timesheet already Published');
                return '';
            }
            var date = CurrentDate.split("-");
            var Year = date[0];
            var month = date[1];
            var MainDate = date[2];
            var StartDate = MainDate + '-' + month + '-' + Year;
            var Hours = parseInt(Duration.split('.')[0]);
            var Minutes = parseInt(Duration.split('.')[1]);


            if (isNaN(Minutes)) {
                Minutes = "00";
            }
            else {
                Minutes = 30
            }
            SelectStream1 = $filter('filter')($scope.TimeSheetdata, { StartDate: StartDate });

            if (SelectStream1.length == 0) {
                var StartTime = CurrentDate + 'T09:00:00';
                var EndTime = CurrentDate + 'T' + (9 + parseInt(Hours)) + ':' + Minutes + ':00';
            }
            else {
                for (i = 0; i < SelectStream1.length; i++) {
                    var Start = SelectStream1[SelectStream1.length - 1].Start;
                    var StartTime = SelectStream1[SelectStream1.length - 1].End;;


                    var getStartHour = StartTime.substring(11, 13);
                    var getStartMin = StartTime.substring(14, 16);

                    var Hour = parseInt(getStartHour) + parseInt(Hours);
                    var Minutes = parseInt(getStartMin) + parseInt(Minutes);

                    if (Minutes >= 60) {
                        MinHour = Math.floor(Minutes / 60);
                        Minutes = Minutes % 60;
                        Hour = Hour + MinHour;
                    }

                    if (Minutes.toString().length == 1) {
                        Minutes = '0' + Minutes;
                    }
                    var getEndDate = Start.substring(0, 11);
                    var EndTime = getEndDate + Hour + ":" + Minutes + ":00"



                }
            }
            var Minute = Duration.split('.')[1];
            if (Minute == undefined) {
                Duration = Hours * 60;
            }
            else {
                Duration = (Hours * 60) + 30;
            }


            $http.post('/InsertTimeSheet', {
                'Text': Activity,
                'Comments': Comments,
                'TaskType': TaskType,
                'Items': Items,
                'StartDate': StartDate,
                'Start': StartTime,
                'End': EndTime,
                'EndDate': CurrentDate,
                'Hours': Duration,
                'phase': document.getElementById("PhaseID").value,
                'ProjectID': $scope.data[0].ProjectID,
                'UserName': UserName,
                'Publish': 0,
                'FacilityID': FacilityService
            }).then(function (response) { DayPilot.Modal.close(); })


        };
        $scope.cancel = function () {

            DayPilot.Modal.close();
        };

        $scope.CalcDuration = function () {
              
            var Duration = document.getElementById("Duration").value;
            if (Duration > $scope.data[0].Duration) {

            }
        }
        $http.get('/PMSConfig/TaskContent.json').success(function (data) {

            $scope.Phase = data.Phase;
            $scope.TaskType = data.TaskType;
            $scope.Item = data.Item;

        });


        // $("#name").focus();
    }]);
