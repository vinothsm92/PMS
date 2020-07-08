var app = angular.module("app", ["xeditable", "angularUtils.directives.dirPagination", "ngCookies",
    "ngNotify", "ngRoute", "ngSanitize", "720kb.datepicker", "daypilot", "ngFileUpload", "dndLists", "ui.router", 'angularjs-dropdown-multiselect','fixed.table.header']);
// configure our routes
app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        //$locationProvider.hashPrefix('');
        // route for the about page

        // For any unmatched url, send to /route1
        $urlRouterProvider.otherwise("/")

        $stateProvider
            .state('/', {
                url: "/",
                templateUrl: "Home.html"
            })
            .state('managerole', {
                url: "/managerole",
                templateUrl: "managerole.html",
                controller: 'RoleViewCtrlq'
            })


            .state('manageuser', {
                url: "/manageuser",
                templateUrl: "manageuser.html",
                controller: 'ManageUserController'
            })

            .state('managefacility', {
                url: "/managefacility",
                templateUrl: "managefacility.html",
                controller: 'FacilityController'
            })

            .state('enterpriseconfig', {
                url: "/enterpriseconfig",
                templateUrl: "Enterpriseconfig.html",
                controller: 'EnterpriseConfigController'
            })


            .state('expenses', {
                url: "/expenses",
                templateUrl: "Expenses.html",
                controller: 'ExpenseCtrl'
            })

            .state('Client_Details', {
                url: "/Client_Details",
                templateUrl: "Client_Details.html",
                controller: 'ClientDetails'
            })

            .state('ManageProjects', {
                url: "/ManageProjects",
                templateUrl: "ManageProjects.html",
                controller: 'ProjectDetails'
            })


            .state('ManageTeams', {
                url: "/ManageTeams",
                templateUrl: "ManageTeams.html",
                controller: 'ManageTeamController'
            })
            .state('Task', {
                url: "/Task",
                templateUrl: "Task.html",
                controller: 'TaskDetails'
            })

            .state('TimeSheet', {
                url: "/TimeSheet",
                templateUrl: "TimeSheet1.html",
                controller: 'TimeSheetCtrl1'
            })

            .state('TeamLeadTimeSheet', {
                url: "/TeamLeadTimeSheet",
                templateUrl: "TeamLeadTimeSheet.html",
                controller: 'TeamLeadTaskDetails'
            })
            .state('ConfigureItemMaster', {
                url: "/ConfigureItemMaster",
                templateUrl: "ConfigureItemMaster.html",
                controller: 'ConfigItemCtrl'
            })
            .state('TimeSheetReport', {
                url: "/TimeSheetReport",
                templateUrl: "TimeSheetReport.html",
                controller: 'TimeSheetReport'
            })
            .state('UtilisationReport', {
                url: "/UtilisationReport",
                templateUrl: "UtilisationReport.html",
                controller: 'UtilisationReport'
            })
            .state('MarginReportTemplate', {
                url: "/MarginReportTemplate",
                templateUrl: "MarginReportTemplate.html",
                controller: 'MarginReportTemplate'
            })
            
        // // route for the about page
        // $routeProvider
        //     .when('/', {
        //         templateUrl: 'UnderConstruction.html',
        //         controller: 'UserNameShowCtrl'
        //     })
        //     .when('/managerole', {
        //         templateUrl: 'managerole.html',
        //         controller: 'RoleViewCtrlq'
        //     })
        //     .when('/manageuser', {
        //         templateUrl: 'manageuser.html',
        //         controller: 'ManageUserController'
        //     })
        //     .when('/ManageFacility', {
        //         templateUrl: 'managefacility.html',
        //         controller: 'FacilityController'
        //     })
        //     .when('/enterpriseconfig', {
        //         templateUrl: 'enterpriseconfig.html',
        //         controller: 'EnterpriseConfigController'
        //     })
        //     .when('/Expenses', {
        //         templateUrl: 'Expenses.html',
        //         controller: 'ExpenseCtrl'
        //     })
        //     .when('/Client_Details', {
        //         templateUrl: 'Client_Details.html',
        //         controller: 'ClientDetails'
        //     }).when('/ManageProjects', {
        //         templateUrl: 'ManageProjects.html',
        //         controller: 'ProjectDetails'
        //     }).when('/ManageTeams', {
        //         templateUrl: 'ManageTeams.html',
        //         controller: 'ManageTeamController'
        //     })
        //     .when('/Task', {
        //         templateUrl: 'Task.html',
        //         controller: 'TaskDetails'
        //     })
        //     .when('/TimeSheet', {
        //         templateUrl: 'TimeSheet.html',
        //         controller: 'TimeSheetCtrl'
        //     }).when('/TeamLeadTimeSheet', {
        //         templateUrl: 'TeamLeadTimeSheet.html',
        //         controller: 'TeamLeadTaskDetails'
        //     })
        //     .otherwise({
        //         template: "<h1>Alert</h1><p>Please enter a valid URL</p>"
        //     });

    }]);
app.factory('StoreService', function () {
    return {
        storedObject: ''
    };
});
app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
}]);

app.controller('UserNameShowCtrl', ['$scope', '$http', '$window', '$filter', '$cookieStore', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, StoreService) {

        //bind Enterprise Logo start
        var logincheck = function () {debugger
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
        var refresh = function () {

            $http.get('/PMSConfig/EnterpriseConfiguration.json').then(function (response) {
                $scope.enterpriseLogo = response.data.EnterpriseConfiguration.EnterpriseLogo;
                $scope.ProjectName = response.data.EnterpriseConfiguration.ApplicationTitle;
                $scope.logoWidth = response.data.EnterpriseConfiguration.logowidth;
                $scope.logoHeight = response.data.EnterpriseConfiguration.logoheight;
                $scope.WidthAndHeight = response.data.EnterpriseConfiguration.logowidthXheight;

            });

        }
        refresh();


        //bind Enterprise Logo end


        $http.get('/GetDistinctFacilityID').then(function (response) {
            $scope.Facilities = response.data;
        });

        $scope.value = $cookieStore.get('FacilityID');

        $scope.FacilityChange = function (data) {
            var SelectStream = [];
            SelectStream = $filter('filter')($scope.FacilityNames, { _id: data });
            SelectStream[0].FacilityName;

            $scope.value = StoreService;
            if ($scope.value.storedObject == "") {

                $scope.value.storedObject = data;
            }
            $cookieStore.put("FacilityID", StoreService);
            $cookieStore.put("FacilityID1", $scope.value.storedObject);
            $cookieStore.put("FacilityName", SelectStream[0].FacilityName);


        };
        $scope.AssignCookietoFacility = function (data) {
            $cookieStore.put("FacilityID1", data);
        }


        $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
        var Loggedinusers = $scope.LoggedinUsers;

        $http.get('/GetFacilityNameFromFacilityUserMapping').then(function (response) {
            $scope.FacilityNames = response.data;
            $scope.FacilityIDSource = [];



            $http.get('/GetFacilityIDFromFacilityUserMapping/' + Loggedinusers).then(function (response) {
                $scope.FacilityIDs = response.data;

                for (i = 0; i < $scope.FacilityNames.length; i++) {

                    var MainFacilityID = $scope.FacilityNames[i]._id;
                    var FacilityName = $scope.FacilityNames[i].FacilityName;
                    for (j = 0; j < $scope.FacilityIDs.length; j++) {
                        var obj = {};
                        var SubFacilityID = $scope.FacilityIDs[j].FacilityID;

                        if (SubFacilityID == MainFacilityID) {
                            var MainIsActive = $scope.FacilityNames[i].IsActive;
                            if (MainIsActive == true) {
                                obj.FacilityID = SubFacilityID;
                                obj.FacilityName = FacilityName;
                                $scope.FacilityIDSource.push(obj);
                            }
                        }
                    }
                }

                $scope.facilitydisable = true;
                $cookieStore.put("FacilityID1", "59a53f0c6077b2a029c52b7f");
                $scope.value = $cookieStore.get('FacilityID');
                $scope.value = { storedObject: "59a53f0c6077b2a029c52b7f" }
                $scope.ShowActiveFacilityName = function (sd) {
                    var SelectStream = [];
                    if (sd.FacilityID) {
                        SelectStream = $filter('filter')($scope.FacilityNames, { _id: sd.FacilityID });
                    }
                    return SelectStream[0].FacilityName;

                };
            });
        });




        $http.get('/PMSConfig/EnterpriseConfiguration.json').then(function (response) {



        });

        $scope.LogoutClick = function () {

            $cookieStore.remove('LoggedinUser');
            $cookieStore.remove("FloorID");
            $cookieStore.remove("BuildingID");
            $cookieStore.remove("NoOfUnits");
            $cookieStore.remove('FacilityID1');
            $cookieStore.remove("FacilityID");
            $cookieStore.remove("ElevatorTripBID");
            $cookieStore.remove("DistanceBuildingID");



        }
    }

]);

app.controller('FooterController', ['$scope', '$http', '$window', '$filter',
    function ($scope, $http, $window, $filter) {



        //get footer version from the PMSCartEstimationToolConfig.json

        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').then(function (response) {
            $scope.HCCartEstimationVersion = response.data.HCCartEstimationVersion[0].VersionNumber;

        });



        //get organization name from the PMSCartEstimationToolConfig.json
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').then(function (response) {
            $scope.OrganizationName = response.data.OrganizationName[0].OrganizationName;

        });


        //get copyright from the PMSCartEstimationToolConfig.json
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').then(function (response) {
            $scope.CopyRight = response.data.CopyRight[0].CopyRight;

        });
    }]);



app.controller('SlideController', ['$scope', '$http', '$window', '$filter', '$cookieStore',
    function ($scope, $http, $window, $filter, $cookieStore) {


        var username = $cookieStore.get('LoggedinUser');
        $scope.menuactive = $cookieStore.get('MenuActive');
        $scope.MenuActiveopen = $cookieStore.get('MenuActiveopen');
        var Removemenuactive = function () {

            document.getElementById("ManageRoleID").classList.remove("active");
            document.getElementById("ManageUserID").classList.remove("active");
            document.getElementById("ManageFacilityID").classList.remove("active");
            document.getElementById("enterpriseconfigID").classList.remove("active");
            document.getElementById("ExpensesID").classList.remove("active");
            document.getElementById("Client_DetailsID").classList.remove("active");
            document.getElementById("ManageProjectsID").classList.remove("active");
            document.getElementById("ManageTeamsID").classList.remove("active");
            document.getElementById("TaskID").classList.remove("active");
            document.getElementById("TimeSheetID").classList.remove("active");
            document.getElementById("TeamLeadTimeSheetID").classList.remove("active");
            document.getElementById("ConfigureItemID").classList.remove("active");
            document.getElementById("TimesheetReportID").classList.remove("active");
            document.getElementById("UtilisationReportID").classList.remove("active");
            document.getElementById("MarginReportTemplateID").classList.remove("active");
        }

        $scope.Menulight = function (ID) {


            Removemenuactive();

            $(".sidebar ul li ul li").closest("li").find(".active").removeClass("active");
            $("#" + ID).addClass("active").parents(".nav li").addClass("active open");


        }
        var refresh = function (ManageUserID) {


            $http.get('/user/' + username).then(function (response) {
                var id = response.data[0].Role;
                $http.get('/Manage_RoleshowPopup/' + id).then(function (response) {

                    $scope.Manage_RolesUIshows = response.data;
                    var viewsshow0 = $scope.Manage_RolesUIshows[0].UIList[0].View;
                    var Editshow0 = $scope.Manage_RolesUIshows[0].UIList[0].Edit;
                    if (viewsshow0 == true) {
                        $scope.show0 = true;
                        $scope.Security = true;
                        $scope.Securityactive0 = "active open";

                    }
                    else {
                        $scope.show0 = false;
                        $scope.Security = false;
                        $scope.Securityactive0 = "";
                        $scope.HideSecurityMenu = "";

                    }

                    if (Editshow0 == true) {
                        $scope.RoleButtonShow = true;
                    }
                    else {
                        $scope.RoleButtonShow = false;
                    }


                    //Manage User

                    var show1 = $scope.Manage_RolesUIshows[0].UIList[1].View;
                    var Editshow1 = $scope.Manage_RolesUIshows[0].UIList[1].Edit;
                    if (show1 == true) {
                        $scope.show1 = true;
                        $scope.Security1 = true;
                        $scope.Securityactive1 = "active open";
                    }
                    else {
                        $scope.show1 = false;
                        $scope.Security1 = false;
                        $scope.Securityactive1 = "";
                        $scope.HideSecurityMenu = "";
                    }
                    if (Editshow1 == true) {
                        $scope.UserButtonShow = true;
                    }
                    else {
                        $scope.UserButtonShow = false;
                    }

                    //Manage Facility

                    var show2 = $scope.Manage_RolesUIshows[0].UIList[2].View;
                    var Editshow2 = $scope.Manage_RolesUIshows[0].UIList[2].Edit;

                    if (show2 == true) {
                        $scope.show2 = true;
                        $scope.Security2 = true;
                        $scope.Securityactive2 = "active open";
                    }
                    else {
                        $scope.show2 = false;
                        $scope.Security2 = false;
                        $scope.Securityactive2 = " ";
                        $scope.HideSecurityMenu = "";
                    }
                    if (Editshow2 == true) {
                        $scope.FacilityButtonShow = true;
                    }
                    else {
                        $scope.FacilityButtonShow = false;
                    }

                    //Enterprise Config

                    var show3 = $scope.Manage_RolesUIshows[0].UIList[3].View;
                    var Editshow3 = $scope.Manage_RolesUIshows[0].UIList[3].Edit;
                    if (show3 == true) {
                        $scope.show3 = true;
                        $scope.Configuration1 = true;
                        $scope.Securityactive3 = "active open";
                    }
                    else {
                        $scope.show3 = false;
                        $scope.Configuration1 = false;
                        $scope.Securityactive3 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow3 == true) {
                        $scope.UpdateEnterpriseConfigButtonShow = true;
                    }
                    else {
                        $scope.UpdateEnterpriseConfigButtonShow = false;
                    }

                    //Expense

                    var show4 = $scope.Manage_RolesUIshows[0].UIList[4].View;
                    var Editshow4 = $scope.Manage_RolesUIshows[0].UIList[4].Edit;
                    if (show4 == true) {
                        $scope.show4 = true;
                        $scope.Configuration2 = true;
                        $scope.Securityactive4 = "active open";
                    }
                    else {
                        $scope.show4 = false;
                        $scope.Configuration2 = false;
                        $scope.Securityactive4 = "";
                        $scope.HideConfigeMenu = "";
                    }

                    if (Editshow4 == true) {
                        $scope.AddResourcebtnShow1 = true;

                        $scope.CopyToBtnShow = true;
                    }
                    else {
                        $scope.AddResourcebtnShow1 = false;
                        $scope.CopyToBtnShow = false;

                    }

                    //Customer Configuration

                    var show5 = $scope.Manage_RolesUIshows[0].UIList[5].View;
                    var Editshow5 = $scope.Manage_RolesUIshows[0].UIList[5].Edit;
                    if (show5 == true) {
                        $scope.show5 = true;
                        $scope.Configuration3 = true;
                        $scope.Securityactive5 = "active open";
                    }
                    else {
                        $scope.show5 = false;
                        $scope.Configuration3 = false;
                        $scope.Securityactive5 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow5 == true) {
                        $scope.AddClientButtonShow = true;
                    }
                    else {
                        $scope.AddClientButtonShow = false;
                    }
                    //Project Definition

                    var show6 = $scope.Manage_RolesUIshows[0].UIList[6].View;
                    var Editshow6 = $scope.Manage_RolesUIshows[0].UIList[6].Edit;
                    if (show6 == true) {
                        $scope.show6 = true;
                        $scope.Configuration4 = true;
                        $scope.Securityactive6 = "active open";
                    }
                    else {
                        $scope.show6 = false;
                        $scope.Configuration4 = false;
                        $scope.Securityactive6 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow6 == true) {
                        $scope.AddProjectButtonShow = true;
                    }
                    else {
                        $scope.AddProjectButtonShow = false;
                    }
                    //Teams

                    var show7 = $scope.Manage_RolesUIshows[0].UIList[7].View;
                    var Editshow7 = $scope.Manage_RolesUIshows[0].UIList[7].Edit;
                    if (show7 == true) {
                        $scope.show7 = true;
                        $scope.Configuration5 = true;
                        $scope.Securityactive7 = "active open";
                    }
                    else {
                        $scope.show7 = false;
                        $scope.Configuration5 = false;
                        $scope.Securityactive7 = "";
                        $scope.HideConfigeMenu = "";
                    }

                    if (Editshow7 == true) {
                        $scope.AddTeamButtonShow = true;

                    }
                    else {
                        $scope.AddTeamButtonShow = false;
                    }


                    var show8 = $scope.Manage_RolesUIshows[0].UIList[8].View;
                    var Editshow8 = $scope.Manage_RolesUIshows[0].UIList[8].Edit;
                    if (show8 == true) {
                        $scope.show8 = true;
                        $scope.Configuration6 = true;
                        $scope.Securityactive8 = "active open";
                    }
                    else {
                        $scope.show8 = false;
                        $scope.Configuration6 = false;
                        $scope.Securityactive8 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow8 == true) {
                        $scope.AddTask1 = true;
                        $window.sessionStorage.setItem("EditTimeSheet", $scope.AddTask1);
                    }
                    else {
                        $scope.AddTask1 = false;
                        $window.sessionStorage.setItem("EditTimeSheet", $scope.AddTask1);
                    }


                    var show9 = $scope.Manage_RolesUIshows[0].UIList[9].View;
                    var Editshow9 = $scope.Manage_RolesUIshows[0].UIList[9].Edit;
                    if (show9 == true) {
                        $scope.show9 = true;
                        $scope.Configuration7 = true;
                        $scope.Securityactive9 = "active open";
                    }
                    else {
                        $scope.show9 = false;
                        $scope.Configuration7 = false;
                        $scope.Securityactive9 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow9 == true) {
                        $scope.EditTimeSheet = true;
                        $window.sessionStorage.setItem("EditTimeSheet", $scope.EditTimeSheet);
                    }
                    else {
                        $scope.EditTimeSheet = false;
                        $window.sessionStorage.setItem("EditTimeSheet", $scope.EditTimeSheet);
                    }

                    var show10 = $scope.Manage_RolesUIshows[0].UIList[10].View;
                    var Editshow10 = $scope.Manage_RolesUIshows[0].UIList[10].Edit;
                    if (show10 == true) {
                        $scope.show10 = true;
                        $scope.Configuration8 = true;
                        $scope.Securityactive10 = "active open";
                    }
                    else {
                        $scope.show10 = false;
                        $scope.Configuration8 = false;
                        $scope.Securityactive10 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow10 == true) {
                        $scope.EditTeamLeadTimeSheet = true;

                    }
                    else {
                        $scope.EditTeamLeadTimeSheet = false;

                    }


                    //configurable item UI
                    var show11 = $scope.Manage_RolesUIshows[0].UIList[11].View;
                    var Editshow11 = $scope.Manage_RolesUIshows[0].UIList[11].Edit;
                    if (show11 == true) {
                        $scope.show11 = true;
                        $scope.Configuration9 = true;
                        $scope.Securityactive11 = "active open";
                    }
                    else {
                        $scope.show11 = false;
                        $scope.Configuration9 = false;
                        $scope.Securityactive11 = "";
                        $scope.HideConfigeMenu = "";
                    }


                    if (Editshow11 == true) {
                        $scope.ConfigureItemButtonShow = true;

                    }
                    else {
                        $scope.ConfigureItemButtonShow = false;

                    }
                    
                    //TimeSheet Report
                    var show12 = $scope.Manage_RolesUIshows[0].UIList[12].View;
                    var Editshow12 = $scope.Manage_RolesUIshows[0].UIList[12].Edit;
                    if (show12 == true) {
                        $scope.show12 = true;
                        $scope.Configuration12 = true;
                        $scope.Securityactive12 = "active open";
                    }
                    else {
                        $scope.show12 = false;
                        $scope.Configuration12 = false;
                        $scope.Securityactive12 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow12 == true) {
                        $scope.EditTeamLeadTimeSheet = true;

                    }
                    else {
                        $scope.EditTeamLeadTimeSheet = false;

                    }

                    //UtiliZation Report
                    var show13 = $scope.Manage_RolesUIshows[0].UIList[13].View;
                    var Editshow13 = $scope.Manage_RolesUIshows[0].UIList[13].Edit;
                    if (show13 == true) {
                        $scope.show13 = true;
                        $scope.Configuration13 = true;
                        $scope.Securityactive13 = "active open";
                    }
                    else {
                        $scope.show13 = false;
                        $scope.Configuration13 = false;
                        $scope.Securityactive13 = "";
                        $scope.HideConfigeMenu = "";
                    }
                    if (Editshow13 == true) {
                        $scope.EditUtiliZationReport = true;

                    }
                    else {
                        $scope.EditTeamLeadTimeSheet = false;

                    }


                });


            });

        }
        refresh();






    }]);

app.controller('ChangePasswordctrl', ['$http', '$scope', '$window', '$cookieStore', '$notify',
    function ($http, $scope, $window, $cookieStore, $notify) {




        $scope.ChangeButtonClick = function () {
            var confirmPwd = '';
            var username = $cookieStore.get('LoggedinUser');

            $http.get('/Header/ChangePassword/' + username).then(function (response) {
                $scope.ChangePasswordShow = response.data;
                var checkuserpassword = $scope.ChangePasswordShow[0].Password;
                var CurrentPWD = $scope.ChangePassword.OldPassword;

                $http.post('/Headers/ChangeCheckPassword', {
                    'checkuserpassword': checkuserpassword,
                    'CurrentPWD': CurrentPWD

                }).then(function (response) {
                    $scope.Manage_RolesUIshows12 = response.data;
                    if (response.data == "Same") {

                        confirmPwd = $scope.ChangePassword.ConfirmPassword;
                        $http.put('/Header/ConfirmPassword/' + confirmPwd + '/' + username).then(function (response) {
                            $scope.Manage_RolesUIshows12 = response.data;

                            $scope.ChangePassword = "";
                            $notify.success('Information', 'Password Successfully Changed');
                        });



                    }
                    else if (response.data == 'Not Same') {
                        $notify.warning('Warning', 'Old Password Mismatched');
                    }
                });

            });
        };

        $scope.deselect = function () {


            $scope.ChangePassword = "";



        };


    }]);
