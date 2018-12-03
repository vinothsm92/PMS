
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var tabname = '';

// app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
//     $httpProvider.defaults.cache = false;
//     if (!$httpProvider.defaults.headers.get) {
//         $httpProvider.defaults.headers.get = {};
//     }
//     $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
// }]);

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

app.controller('RoleViewCtrlq', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, $routeParams) {




        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {
            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[0].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }



        var refresh = function () {
            $http.get('/Manage_Rolesshow').then(function (response) {
                $scope.Manage_Roleser = response.data;

            });



            //Get Project Info View Rights
            $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
                if (data.ProjectInfoViewRights.length > 0) {
                    $scope.PInfoViewRights = data.ProjectInfoViewRights;


                }
                else {
                    $notify.warning('warning', "Check Project Info View Rights in json file");
                }


            });



            //bind role name

            $scope.showProjectViewInfoRights = function (Manage_Role) {
                var SelectStreams = [];
                if (Manage_Role.ProjectViewInfoRights) {
                    SelectStreams = $filter('filter')($scope.PInfoViewRights, { Value: Manage_Role.ProjectViewInfoRights });
                }
                return SelectStreams.length ? SelectStreams[0].Value : 'select';

            };
        };

        //Show GridRebindBasedTab
        $scope.showAllRolesFilter = true;

        var GetTabData = "";
        $scope.ManageRoleGridRebindBasedTab = function (data) {

            GetTabData = data;
            if (data == "AllResource") {
                $scope.showAllRolesFilter = true;
                tabname = "AllResource";
            }
            if (data == "AResourceType") {
                $scope.showAllRolesFilter = false;
                tabname = "AResourceType";
            }
            if (data == "IAResourceType") {
                $scope.showAllRolesFilter = false;
                tabname = "IAResourceType";
            }

            MainManageRoleGridRebindBasedTab(data);


        }

        //bind all resource types grid



        var MainManageRoleGridRebindBasedTab = function (data) {
            if (data == "AllResource") {

                $http.get('/Manage_Rolesshow').then(function (response) {
                    $scope.Manage_Roleser = response.data;

                });

            }
            if (data == "AResourceType") {

                $http.get('/GetActiveResourceType').then(function (response) {
                    $scope.Manage_Roleser = response.data;
                });

            }
            if (data == "IAResourceType") {

                $http.get('/GetInActiveResourceType').then(function (response) {
                    $scope.Manage_Roleser = response.data;
                });
            }
        }





        //custom filter for dropdown


        $scope.ViewRightsFilter = function (data) {


            $scope.ProjectInfoViewRights1 = data;
        };


        $scope.customViewRightsFilter = function (Manage_Role) {

            if ($scope.ProjectInfoViewRights1 == undefined) { return true }
            else {
                var Pviewrights = $scope.showProjectViewInfoRights(Manage_Role);
                return (Pviewrights.toLowerCase().indexOf($scope.ProjectInfoViewRights1.toLowerCase()) !== -1);
            }
        };




        $scope.Rolepopupclick = function (RoleId, RoleName) {

            var id = RoleId;
            $scope.SelectedRoleName = RoleName;
            $http.get('/Manage_RoleshowPopup/' + id).success(function (response) {
                $scope.Manage_RolesUIshow = response;
            });
            NotifyCount = 1;
        };



        $scope.verifyRoleDuplicate = function () {
            for (i = 0; i < $scope.Manage_Roleser.length; i++) {

                var RoleNamechk = $scope.Manage_Roleser[i].RoleName;
                if ($scope.Role.RoleName == RoleNamechk) {
                    $scope.disableds = true;

                    $notify.warning('Warning', "Role name" + " '" + $scope.Role.RoleName + "' " + "already exist ");

                    break;
                }
                else {
                    $scope.disableds = false;
                }
            }

        }

        $scope.saveTable = function () {
            ;
            if (NotifyCount != 1) {
                var RoleNamechk = '';
                for (var i = 0; i < $scope.Manage_Roleser.length; i++) {
                    RoleNamechk = $scope.Manage_Roleser[i].RoleName.toUpperCase();
                    var id = $scope.Manage_Roleser[i]._id;
                    var isactive = $scope.Manage_Roleser[i].IsActive;
                    var rolename = $scope.Manage_Roleser[i].RoleName.toUpperCase();
                    var SelectStream1 = [];
                    if (isactive == false) {
                        SelectStream1 = $filter('filter')($scope.Manage_Users, { Role: id });
                        if (SelectStream1.length != 0) {
                            $notify.warning('Warning', rolename + " Role is assigned to User");
                            count = 0;
                            return '';
                        }

                    }


                    for (var j = 0; j < $scope.Manage_Roleser.length; j++) {
                        var RoleName = $scope.Manage_Roleser[j].RoleName.toUpperCase();
                        if (RoleNamechk == RoleName) {
                            count++;
                        }
                    }
                }

                if (count == $scope.Manage_Roleser.length) {
                    for (var i = 0; i < $scope.Manage_Roleser.length; i++) {
                        var id = $scope.Manage_Roleser[i]._id;
                        var rolename = $scope.Manage_Roleser[i].RoleName.toUpperCase();
                        var isactive = $scope.Manage_Roleser[i].IsActive;
                        var description = $scope.Manage_Roleser[i].Description;
                        var viewRights = $scope.Manage_Roleser[i].ProjectViewInfoRights;

                        var assignmntRequired = $scope.Manage_Roleser[i].IsProjectAssignmentRequired;
                        if (description == "" || description == undefined) {
                            description = '';
                        }

                        if ($scope.Manage_Roleser[i].DirtyFlag == "True") {
                            $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
                            var updatedBy = $scope.LoggedinUsers;

                            $http.put('/Roleupdate/', {
                                'id': id,
                                'rolename': rolename,
                                'isactive': isactive,
                                'description': description,
                                'projectviewRights': viewRights,
                                'projectassignmentRequired': assignmntRequired,
                                'updatedBy': updatedBy

                            }).then(function (response) {
                                refresh();
                                MainManageRoleGridRebindBasedTab(tabname);

                            });

                        }
                        count = 0;
                    }
                    debugger
                    $notify.success('Success', 'Role is updated successfully');


                }
                else {
                    $notify.warning('Warning', 'Role name already exist');
                    count = 0;
                    return '';
                }
            }
        };





        $scope.showFrm = function () {
            $scope.showError = true;

        }

        $scope.NotifyClick = function () {

            NotifyCount = 2;

        }

        $scope.UIUpdateTable = function () {
            ;

            var id = '';
            for (var i = 0; i < $scope.Manage_RolesUIshow.length; i++) {

                id = $scope.Manage_RolesUIshow[i]._id;
                for (var j = 0; j < $scope.Manage_RolesUIshow[0].UIList.length; j++) {
                    var uiname = $scope.Manage_RolesUIshow[0].UIList[j].UiName;
                    var view = $scope.Manage_RolesUIshow[0].UIList[j].View;
                    var edit = $scope.Manage_RolesUIshow[0].UIList[j].Edit;
                    $http.put('/ViewEditupdate/' + id + '/' + uiname + '/' + view + '/' + edit).then(function (response) {

                        refresh();
                    })
                }
                debugger
                $notify.success('Success', 'Role is updated successfully');
                $('#Div1').modal('hide');
            }
        };

        $scope.refreshUI = function () {
            debugger
            if (GetTabData == "") {
                refresh();
            } else { MainManageRoleGridRebindBasedTab(GetTabData); }

        }



        $scope.AddRole = function () {

            ;
            $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
            var CreatedById = $scope.LoggedinUsers;

            $http.post('/AddNewRole',
                {
                    'RoleName': $scope.Role.RoleName,
                    'Description': $scope.Role.Description,
                    'IsActive': $scope.Role.IsActive,
                    'projectviewRights': $scope.ProjectInfoViewRights,
                    'projectpassignmentRequired': $scope.Role.IsProjectAssignmentRequired,
                    'CreatedById': CreatedById
                }).then(function (response) {

                    $notify.success('Success', "New Role" + " '" + $scope.Role.RoleName + "' " + "is  saved successfully");

                    refresh();
                    $scope.Role = '';

                })
        };


        var HideLoadingPanel = function () {

            function remove() {
                $("div#divLoading").removeClass('show');
            }
            setTimeout(remove, 1000);
        }







        $scope.deselect = function () {
            $scope.Role = "";



        }


        $scope.chkbxEditChanged = function (index) {



            var sdf = $scope.Manage_RolesUIshow[0].UIList[index].UiName;

            var sdfds = document.getElementById(sdf);

            $scope.Manage_RolesUIshow[0].UIList[index].View = true;

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


        $scope.pagination = {
            current: 1
        };


        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {

            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;

            $scope.ItemsPerPageCounts1 = data.ItemPerPage;
            $scope.ItemsPerPageCount1 = $scope.ItemsPerPageCounts1[0].PageID;
        });
        $scope.ItemsPerPageChange = function () {


            $scope.ItemsPerPageCount;

            refresh();

        }
        $scope.ItemsPerPageChange1 = function () {

            var e = document.getElementById("ItemsPerPageID1");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount1 = ItemsPerPageID;

            refresh();

        }

        //Get Project Info View Rights
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            if (data.ProjectInfoViewRights.length > 0) {
                $scope.PInfoViewRights = data.ProjectInfoViewRights;
            }
            else {
                $notify.warning('warning', "Check Project Info View Rights in json file");
            }


        });









        $http.get('/Manage_Usershow').then(function (response) {
            $scope.Manage_Users = response.data;

        });

        $scope.removeHighlight = function () {
            $(event.currentTarget).closest('form').find("td.highlighted").removeClass("highlighted");
        }


        $scope.applyHighlight = function ($data, index, pageNumber, id) {
            debugger
            for (var i = 0; i < $scope.Manage_Roleser.length; i++) {
                if ($scope.Manage_Roleser[i]._id == id) {
                    $scope.Manage_Roleser[i].DirtyFlag = "True";


                }
            }
            var dataSpan = $(event.currentTarget).closest('td');
            if (!dataSpan.hasClass("highlighted")) {
                $(dataSpan).addClass("highlighted");
            }







        }


    }]);
