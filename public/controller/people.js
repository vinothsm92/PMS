var app = angular.module('timesheet.people', ['daypilot', 'ngRoute']);

app.controller('PeopleCtrl', function ($scope, $timeout, $http, $location, $routeParams) {

    $scope.navigatorConfig = {
      
        selectMode: "week",
        showMonths: 3,
        skipMonths: 3,
        onTimeRangeSelected: function (args) {
            loadEvents();    ;
        }
    };

    $scope.events = [];

    $scope.scheduler = {
        viewType: "Days",
        showNonBusiness: false,
        businessBeginsHour: 9,
        businessEndsHour: 17,
        cellWidthSpec: "Auto",
        scale: "CellDuration",
        cellDuration: "15",
        useEventBoxes: "Never",
        days: new DayPilot.Date().dayOfWeek(),
        startDate: new DayPilot.Date().firstDayOfWeek(),
        timeHeaders: [
            { groupBy: "Hour" },
            { groupBy: "Cell", format: "" }
        ],
        rowHeaderColumns: [
            { title: "Date" },
            { title: "Total" }
        ],
        onBeforeEventRender: function (args) {

            if (args.data.project) {
                args.data.html = args.data.text + " (" + args.data.project + ")";
            }
        },
        onBeforeRowHeaderRender: function (args) {
              ;
            var duration = args.row.events.totalDuration();
            if (duration.ticks > 0) {
                args.row.columns[0].html = duration.toString("h") + "h " + duration.toString("m") + "m";

               
            }
        },
        onEventMoved: function (args) {
            var params = {
                id: args.e.id(),
                start: args.newStart.toString(),
                end: args.newEnd.toString()
            };
            $http.post("backend_move.php", params).then(function (response) {
                $scope.dp.message("Moved.");
            });
        },
        onEventResized: function (args) {
            var params = {
                id: args.e.id(),
                start: args.newStart.toString(),
                end: args.newEnd.toString()
            };
            $http.post("backend_move.php", params).then(function (response) {
                $scope.dp.message("Resized.");
            });
        },
        onTimeRangeSelected: function (args) {
              

            var start = args.start.toString();
            var end = args.end.toString();
            var text = "Activity";
            var resource = $scope.selectedPerson.id;

            $scope.dp.clearSelection();
            $http.post('/SaveActivity', {


                Start: start,
                End: end,
                Text: text,
                Resource: resource


            }).then(function (response) {
                var data = response.data;
                $scope.events.push({
                    id: data[0]._id,
                    text: data[0].Text,
                    start: data[0].Start,
                    end: data[0].End
                });
            });
        },
        onEventClick: function (args) {
            var modal = new DayPilot.Modal({
                onClosed: function () {
                    loadEvents();
                }
            });

            modal.showUrl("edit.html#/?id=" + args.e.id());
        }
    };
    var refresh = function () {
          

        $http.get('/GetTimeSheet').then(function (response) {

            var data = response.data;
            for (i = 0; i < data.length; i++) {
                $scope.events.push({
                    id: data[i]._id,
                    text: data[i].Text,
                    start: data[i].Start,
                    end: data[i].End
                });
            }
        });

    };

    refresh();
    $scope.onSelectedPersonChanged = function () {
        loadEvents();
    };

    $timeout(function () {
        dp = $scope.dp;
        loadPeople();
    });

    function loadPeople() {
       
        $http.get('/Manage_Usershow').then(function (response) {
            var data = response.data;
            $scope.people = data;
            $scope.selectedPerson = data[0];

            if (!$scope.events) {
                loadEvents();
            }
        });
    }

    function loadEvents() {
       
  
        var start = $scope.navigator.selectionStart;
        var days = start.daysInMonth();
        var end = start.addDays(days);

        var params = {
            start: start.toString(),
            end: end.toString(),
            resource: $scope.selectedPerson.id
        };

        $http.post("backend_events_resource.php", params).then(function (response) {
            var data = response.data;
            $scope.scheduler.startDate = start;
            $scope.scheduler.days = days;
            $scope.events = data;
        });

        $scope.scheduler = {
            viewType: "Days",
            showNonBusiness: false,
            businessBeginsHour: 9,
            businessEndsHour: 17,
            cellWidthSpec: "Auto",
            scale: "CellDuration",
            cellDuration: "15",
            useEventBoxes: "Never",
            days: new DayPilot.Date().dayOfWeek(),
            startDate: $scope.navigator.selectionStart}
        
    }
});
