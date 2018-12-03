var app = angular.module('timesheet.people', ['daypilot']);

app.controller('PeopleCtrl', function($scope, $timeout, $http) {

    $scope.scheduler = {
        viewType: "Days",
        showNonBusiness: false,
        businessBeginsHour: 9,
        businessEndsHour: 17,
        cellWidthSpec: "Auto",
        scale: "CellDuration",
        cellDuration: "15",
        useEventBoxes: "Never",
        timeHeaders: [
            { groupBy: "Hour" },
            { groupBy: "Cell", format: "" }
        ],
        rowHeaderColumns: [
            {title: "Date"},
            {title: "Total"}
        ],
        onBeforeEventRender: function(args) {
            if (args.data.project) {
                args.data.html = args.data.text + " (" + args.data.project + ")";
            }
        },
        onBeforeRowHeaderRender: function(args) {
            var duration = args.row.events.totalDuration();
            if (duration.ticks > 0) {
                args.row.columns[0].html = duration.toString("h") + "h " + duration.toString("m") + "m";
            }
        },
        onEventMoved: function(args) {
            var params = {
                id: args.e.id(),
                start: args.newStart.toString(),
                end: args.newEnd.toString()
            };
            $http.post("backend_move.php", params).then(function(response) {
                $scope.dp.message("Moved.");
            });
        },
        onEventResized: function(args) {
            var params = {
                id: args.e.id(),
                start: args.newStart.toString(),
                end: args.newEnd.toString()
            };
            $http.post("backend_move.php", params).then(function(response) {
                $scope.dp.message("Resized.");
            });
        },
        onTimeRangeSelected: function(args) {
            var params = {
                start: args.start.toString(),
                end: args.end.toString(),
                text: "Activity",
                resource: $scope.selectedPerson.id
            };
            $scope.dp.clearSelection();
            $http.post("backend_create.php", params).then(function(response) {
                var data = response.data;
                $scope.events.push({
                    id: data.id,
                    text: params.text,
                    start: params.start,
                    end: params.end
                });
            });
        },
        onEventClick: function(args) {
            var modal = new DayPilot.Modal({
                onClosed: function() {
                    loadEvents();
                }
            });

            modal.showUrl("edit.html#/?id=" + args.e.id());
        }
    };
    $scope.onSelectedPersonChanged = function() {
        loadEvents();
    };

    $timeout(function() {
        dp = $scope.dp;
        loadPeople();
    });

    function loadPeople() {
        //console.log("Loading people");
        $http.post("backend_resources.php").then(function(response) {
            var data = response.data;
            $scope.people = data;
            $scope.selectedPerson = data[0];

            if (!$scope.events) {
                loadEvents();
            }
        });
    }

    function loadEvents() {
        //console.log("Loading events");

        var start = $scope.navigator.selectionStart;
        var days = start.daysInMonth();
        var end = start.addDays(days);

        var params = {
            start: start.toString(),
            end: end.toString(),
            resource: $scope.selectedPerson.id
        };

        $http.post("backend_events_resource.php", params).then(function(response) {
            var data = response.data;
            $scope.scheduler.startDate = start;
            $scope.scheduler.days = days;
            $scope.events = data;
        });
    }

});