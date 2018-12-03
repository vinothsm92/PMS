var app = angular.module('timesheet.projects', ['daypilot', 'ngRoute']);

app.controller('ProjectsCtrl', function($scope, $timeout, $http, $location, $routeParams, $q) {
    $scope.navigatorConfig = {
        selectMode: "month",
        showMonths: 3,
        skipMonths: 3,
        onTimeRangeSelected: function(args) {
            loadEvents();
        }
    };

    $scope.events = null;

    $scope.scheduler = {
        days: 30,
        cellDuration: "60",
        showNonBusiness: false,
        useEventBoxes: "Never",
        rowHeaderColumns: [
            {title: "Person"},
            {title: "Total"}
        ],
        onBeforeEventRender: function(args) {
            args.data.moveVDisabled = true;
        },
        onBeforeRowHeaderRender: function(args) {
            var duration = args.row.events.totalDuration();
            if (duration.ticks > 0) {
                args.row.columns[0].html = duration.toString("h") + "h " + duration.toString("m") + "m";
            }
        },
        onEventClick: function(args) {
            var modal = new DayPilot.Modal({
                onClosed: function() {
                    loadEvents();
                }
            });

       
            modal.showUrl("edit.html#/?id=" + args.e.id());
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
                $scope.dp.message("Moved.");
            });
        },
    };

    $scope.onSelectedProjectChanged = function() {
        loadEvents();
    };

    $timeout(function() {
        dp = $scope.dp;
        loadProjects();
    });

    function loadResources() {
        $http.post("backend_resources.php").then(function(response) {
            $scope.scheduler.resources = resources;
        });
    }

    function loadEvents() {
      

        var start = $scope.navigator.selectionStart;
        var days = start.daysInMonth();
        var end = start.addDays(days);

        var params = {
            start: start.toString(),
            end: end.toString(),
            project: $scope.selectedProject.id
        };

        $q.all([
            $http.post("backend_resources.php"),
            $http.post("backend_events_project.php", params)
        ]).then(function(args) {
            var resources = args[0].data;
            var events = args[1].data;

            $scope.scheduler.resources = resources;
            $scope.scheduler.startDate = start;
            $scope.scheduler.days = days;
            $scope.events = events;
        });
    }

    function loadProjects() {
       
        $http.post("backend_projects.php").then(function(response) {
            var data = response.data;
            $scope.projects = data;
            $scope.selectedProject = data[0];

            if (!$scope.events) {
                loadEvents();
            }
        });
    }
});