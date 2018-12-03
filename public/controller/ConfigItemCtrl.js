
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var tabname = '';
var FacilityService = '';



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

app.controller('ConfigItemCtrl', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout',
    'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {



        debugger;
        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;
        var username = $cookieStore.get('LoggedinUser');
        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {

            debugger;

            if (newVal != '') {
                FacilityService = newVal;
                refresh();
                $http.get('/ConfigureItems_Show/' + FacilityService).then(function (response) {
                    $scope.Manage_Roleser = response.data;

                });

            } refresh();
        });


        var refresh = function () 
        {
            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
            }
            
            else {
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $http.get('/ConfigureItems_Show/' + FacilityService).then(function (response) {
                    $scope.Manage_Roleser = response.data;
    
                });
            }
        }

        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {
            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[11].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });      
        };




        $scope.verifyRoleDuplicate = function () 
        {
            for (i = 0; i < $scope.Manage_Roleser.length; i++) {
                var idchk = $scope.Manage_Roleser[i].ID;
                var RoleNamechk = $scope.Manage_Roleser[i].Name;
                if ($scope.ConfigItem.ID == idchk) {
                    $scope.disableds = true;

                    $notify.warning('Warning', "Configure Item" + " '" + $scope.ConfigItem.ID + "' " + "already exist ");

                    break;
                }
                else {
                    $scope.disableds = false;
                }
            }

        }




        $scope.UpdateConfigureItemsTable = function () {
            debugger;
            if (NotifyCount != 1) {
                var RoleNamechk = '';
                for (var i = 0; i < $scope.Manage_Roleser.length; i++) {
                    RoleNamechk = $scope.Manage_Roleser[i].Name.toUpperCase();
                    var id = $scope.Manage_Roleser[i]._id;
                    var ID = $scope.Manage_Roleser[i].ID;
                    var rolename = $scope.Manage_Roleser[i].Name.toUpperCase();
                    var SelectStream1 = [];
                    for (var j = 0; j < $scope.Manage_Roleser.length; j++) {
                        var RoleName = $scope.Manage_Roleser[j].Name.toUpperCase();
                        var configitemIDVal = $scope.Manage_Roleser[j].ID;
                        if (ID == configitemIDVal) {
                            count++;
                        }
                    }
                }

                if (count == $scope.Manage_Roleser.length) {
                    for (var i = 0; i < $scope.Manage_Roleser.length; i++) {
                        var ItemID = $scope.Manage_Roleser[i].ID;
                        var id = $scope.Manage_Roleser[i]._id
                        var Name = $scope.Manage_Roleser[i].Name.toUpperCase();
                        var Description = $scope.Manage_Roleser[i].Description;
                        if (Description == "" || Description == undefined) {
                            Description = '';
                        }

                        if ($scope.Manage_Roleser[i].DirtyFlag == "True") {
                            $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
                            var updatedBy = $scope.LoggedinUsers;
                            $http.put('/UpdateConfigureItem/', {
                                'id': id,
                                'ID': ItemID,
                                'Name': Name,
                                'FacilityID': FacilityService,
                                'Description': Description,
                               'updatedBy': updatedBy
                            }).then(function (response) {
                                refresh();
                           });
                        }
                        count = 0;
                    }
                                   $notify.success('Success', 'Configure Item is updated successfully');
                }
                else {
                    $notify.warning('Warning', 'Configure Item  already exist');
                    count = 0;
                    return '';
                }
            }
        };



        $scope.DeleteConfigureItem = function (id) {
            ConfigureItemId = id;

        }

        $scope.DeleteConfigureItemKey = function () {
            $http.delete('/DeleteConfigureItem/' + ConfigureItemId).then(function (response) {
                $notify.success('Success', 'Configure Item is deleted successfully');
                refresh();
            });
        }



        $scope.NotifyClick = function () {

            NotifyCount = 2;

        }


        $scope.refreshUI = function () {

            refresh();

        }

        
        $scope.UniqueIndentityIDDisable = true;
        var maxUniqID = 0;

        $scope.getuniqItemID = function () {
            $http.get('/ConfigureItems_Show/' + FacilityService).then(function (response) {
                $scope.GetUniqID = response.data;
                if ($scope.GetUniqID.length > 0) {
                    var maxUniqID = Math.max.apply(null, $scope.GetUniqID.map(function (item) {
                        return item.ID;
                    }))
                    if (Name != null || Name != undefined) {
                        $scope.ConfigItem = { ID: (maxUniqID + 1) };
                    } else {
                        $scope.ConfigItem = { ID: "" };
                    }
                }
                else {
                    $scope.ConfigItem = { ID: 1 };
                }

            });
        }


        $scope.AddConfigItem = function () {
            $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
            var CreatedById = $scope.LoggedinUsers;
            $http.post('/AddNewConfigureItem',
                {
                    'ID': $scope.ConfigItem.ID,
                    'Name': $scope.ConfigItem.Name,
                    'Description': $scope.ConfigItem.Description,
                    'FacilityID': FacilityService,
                    'CreatedById': CreatedById

                }).then(function (response) {
                    $notify.success('Success', "New Config" + " '" + $scope.ConfigItem.Name + "' " + "is  saved successfully");
                    refresh();
                    $scope.ConfigItem = '';
                })
        };



        var HideLoadingPanel = function () {
            function remove() {
                $("div#divLoading").removeClass('show');
            }
            setTimeout(remove, 1000);
        }

        $scope.deselect = function () {
            $scope.ConfigItem = "";
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
                        $scope.ShowBody = false;
                        $scope.viewaccesspage = false;

                        $window.location.href = '/';

                    }
                });
            };
            $scope.ShowBody = false;
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

                var e = document.getElementById("ItemsPerPageID");
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
