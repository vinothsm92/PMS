
var keyid = "";
var count = 0;


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



app.controller('ManageUserController', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify',
    function ($scope, $http, $window, $filter, $cookieStore, $notify) {

        // //Prevent Browser back button press
        // $scope.$on('$locationChangeStart', function (event, next, current) {
        //     event.preventDefault();
        // });


        $scope.MenuActive = "active";
        var refresh = function () {

            $http.get('/Manage_Usershow').then(function (response) {

                $scope.Manage_Users = response.data;
            });



            //bind role name

            $scope.showRoleName = function (Manage_User) {
                var SelectStreams = [];
                if (Manage_User.Role) {
                    SelectStreams = $filter('filter')($scope.RoleNameValues, { _id: Manage_User.Role });
                }
                return SelectStreams.length ? SelectStreams[0].RoleName : 'Select';

            };
        };

        $scope.refreshUI = function () {

            refresh();
        }
        var UserMappingRefersh = function () {

            $http.get('/UserIDFromMappingtable').then(function (response) {
                $scope.getuserids = response.data;
            });
        };




        $scope.saveManageUserTable = function () {

            debugger
            $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
            var UpdatedById = $scope.LoggedinUsers;
            var ResourceIDchk = '';
            for (var a = 0; a < $scope.Manage_Users.length; a++) {
                ResourceIDchk = $scope.Manage_Users[a].ResourceID;
                for (var b = 0; b < $scope.Manage_Users.length; b++) {
                    var ResourceIDchk1 = $scope.Manage_Users[b].ResourceID;
                    var Rolechk1 = $scope.Manage_Users[b].Role;
                    var Statuschk1 = $scope.Manage_Users[b].IsApprovedByAdmin;
                    var ResourceIDChk = $scope.Manage_Users[b].ResourceIDChk;
                    var RoleIDCheck = $scope.Manage_Users[b].RoleIDCheck;


                    if (ResourceIDChk == 'true' && RoleIDCheck == 'true' && Statuschk1 == 2) {
                        $notify.warning('Warning', "Rejected User can't able to set Role & Resource ID");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDChk == 'true' && Statuschk1 == 2) {
                        $notify.warning('Warning', "Rejected User can't able to set Resource ID");
                        count = 0;
                        return true;
                    }

                    if (RoleIDCheck == 'true' && Statuschk1 == 2) {
                        $notify.warning('Warning', "Rejected User can't able to set Role");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 == undefined && Rolechk1 != undefined && Statuschk1 == undefined) {
                        $notify.warning('Warning', "Please select ResourceID & Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 != undefined && Rolechk1 == undefined && Statuschk1 == undefined) {
                        $notify.warning('Warning', "Please select Role & Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 != undefined && Rolechk1 != undefined && Statuschk1 == undefined) {
                        $notify.warning('Warning', "Please select Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 == undefined && Rolechk1 != undefined && Statuschk1 != undefined) {
                        $notify.warning('Warning', "Please enter ResourceID");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 != undefined && Rolechk1 == undefined && Statuschk1 != undefined) {
                        $notify.warning('Warning', "Please Select the Role");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 != undefined && Rolechk1 == undefined && Statuschk1 == "undefined") {
                        $notify.warning('Warning', "Please select Role & Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 == undefined && Rolechk1 == undefined && Statuschk1 == 1) {
                        $notify.warning('Warning', "Please select Role & Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 != undefined && Rolechk1 != undefined && Statuschk1 == "undefined") {
                        $notify.warning('Warning', "Please select  Status");
                        count = 0;
                        return true;
                    }
                    if (ResourceIDchk1 == undefined && Rolechk1 != undefined && Statuschk1 == "undefined") {
                        $notify.warning('Warning', "Please select Status & Resource ID");
                        count = 0;
                        return true;
                    }

                    if (ResourceIDchk == ResourceIDchk1) {
                        if (ResourceIDchk == undefined || ResourceIDchk == "") {
                            count++;
                            break;
                        }
                        count++;
                    }


                }
            }
            if (count == $scope.Manage_Users.length) {

                for (let i = 0; i < $scope.Manage_Users.length; i++) {

                    var id = $scope.Manage_Users[i]._id;
                    var displayname = $scope.Manage_Users[i].UserName;
                    var email = $scope.Manage_Users[i].Email;
                    var fname = $scope.Manage_Users[i].FirstName;
                    var lname = $scope.Manage_Users[i].LastName;
                    var mobile = $scope.Manage_Users[i].PhoneNumber;
                    var role = $scope.Manage_Users[i].Role;
                    if (role == " " || role == undefined) {
                        role = 'Select';
                    }
                    var emailverified = $scope.Manage_Users[i].EmailVerifiedbyUser;
                    var status = $scope.Manage_Users[i].IsApprovedByAdmin;
                    var isActive = $scope.Manage_Users[i].IsActive;
                    var ResourceID = $scope.Manage_Users[i].ResourceID;




                    if (status == undefined) {
                        if (ResourceIDchk1 == undefined && Rolechk1 == undefined && Statuschk1 == undefined) {
                            updatecount = 1;
                            if (updatecount != 1) {
                                $http.put('/ManageUserUpdate1/' + id + '/' + displayname + '/' + email + '/'
                                    + fname + '/' + lname + '/' + mobile + '/' + emailverified + '/'
                                    + status + '/' + isActive + '/' + UpdatedById).then(function (response) {
                                        count = 0;
                                        $scope.dataa = response.data;


                                    });
                                count = 0;
                            }

                        }

                    }
                    var checkduplicate = function () {
                        if (ResourceID == '' && status == '') {
                            $notify.warning('Warning', "Please select Resource ID and Status");
                            count = 0;
                            return true;
                        }
                        if (ResourceID == undefined && status == undefined) {
                            $notify.warning('Warning', "Please select Resource ID and Status");
                            count = 0;
                            return true;
                        }


                        if (status == '' && role == '') {
                            $notify.warning('Warning', "Please select Role and Status");
                            count = 0;
                            return true;
                        }
                        if (status == undefined && role == 'Select') {
                            $notify.warning('Warning', "Please select Role and Status");
                            count = 0;
                            return true;
                        }
                        if (ResourceID != '' && role != '' && status == '') {
                            $notify.warning('Warning', "Please select Status");
                            count = 0;
                            return true;
                        }
                        if (ResourceID != '' && role != '' && status == undefined) {
                            $notify.warning('Warning', "Please select Status");
                            count = 0;
                            return true;
                        }
                    }

                    if (status == 1 || status == 2 || status == undefined) {

                        if (status == 1) {
                            checkduplicate();
                            if (ResourceID == '' && role == '') {
                                $notify.warning('Warning', "Please select Role and Resource ID");
                                count = 0;
                                return true;
                            }

                            if (ResourceID == undefined && role == 'Select') {
                                $notify.warning('Warning', "Please select Role and Resource ID");
                                count = 0;
                                return true;
                            }
                            if (ResourceID == undefined || ResourceID == '') {
                                $notify.warning('Warning', "Please enter Resource ID");
                                count = 0;
                                return true;
                            }

                            if (ResourceID != '') {
                                if (status == 1 && emailverified == true && role != "Select" && role != '') {
                                    if (ResourceID == '' || role == undefined) {
                                        $notify.warning('Warning', "Resource ID");
                                        count = 0;
                                        return true;

                                    }
                                    if (isActive == undefined) {
                                        isActive = false;
                                    }
                                    $http.put('/ManageUserUpdate/' + id + '/' + ResourceID + '/' + displayname + '/' + email + '/'
                                        + fname + '/' + lname + '/' + mobile + '/' + role + '/' + emailverified + '/'
                                        + status + '/' + isActive + '/' + UpdatedById).then(function (response) {

                                            refresh();

                                        });
                                    count = 0;

                                    if ($scope.Manage_Users[i].DirtyFlagmail == "true") {
                                        $http.put('/IsApprovedByAdmin/' + fname + '/' + lname + '/' + email).then(function (response) {

                                        });
                                        count = 0;
                                    }
                                }
                                else {
                                    if (status == 2) {

                                        ;
                                        if (role == '') {
                                            role = 'Select';
                                        };
                                        if (emailverified == '' || emailverified == undefined) {
                                            emailverified = false;
                                            isActive = false;
                                        };
                                        $http.put('/ManageUserUpdate/' + id + '/' + ResourceID + '/' + displayname + '/' + email + '/'
                                            + fname + '/' + lname + '/' + mobile + '/' + role + '/' + emailverified + '/'
                                            + status + '/' + isActive + '/' + UpdatedById).then(function (response) {
                                                $scope.dataa = response.data;
                                                count = 0;
                                                refresh();

                                            });
                                        if ($scope.Manage_Users[i].DirtyFlagmail == "true") {
                                            $http.put('/IsRejectedByAdmin/' + fname + '/' + lname + '/' + email).then(function (response) {

                                                count = 0;
                                            });
                                        }


                                    }
                                    else {
                                        ;
                                        if (emailverified == false || emailverified == '' || emailverified == undefined) {
                                            $notify.warning('Warning', "Email address not verified by the User");
                                            count = 0;
                                            return true;
                                        }
                                        if (role == 'Select' || role == '' || role == undefined) {
                                            if (ResourceID == '' || role == undefined) {
                                                $notify.warning('Warning', "Please select Role and Resource ID");
                                                count = 0;
                                                return true;

                                            }
                                            else {
                                                $notify.warning('Warning', "Please select Role Name");
                                                count = 0;
                                                return 'werewr';
                                            }
                                        }
                                        if (status == 3 || status == '' || status == undefined) {
                                            $notify.warning('Warning', "Please select Status");
                                            count = 0;
                                            return true;
                                        }
                                        if (ResourceID == '' || role == undefined) {
                                            $notify.warning('Warning', "Resource ID");
                                            count = 0;
                                            return true;

                                        }

                                    }

                                }

                            }
                            else {
                                $notify.warning('Warning', "Please enter Resource ID");
                                count = 0;
                                return true;
                            }
                        }

                        else {
                            count = 0;
                            var ResourceIDchk = '';
                            for (var a = 0; a < $scope.Manage_Users.length; a++) {
                                ResourceIDchk = $scope.Manage_Users[a].ResourceID;
                                for (var b = 0; b < $scope.Manage_Users.length; b++) {
                                    var ResourceIDchk1 = $scope.Manage_Users[b].ResourceID;
                                    if (ResourceIDchk == ResourceIDchk1) {
                                        if (ResourceIDchk == undefined) {
                                            count++;
                                            break;
                                        }
                                        count++;
                                    }
                                }
                            }
                            if ($scope.Manage_Users[i].DirtyFlagmail == "true") {
                                $http.put('/IsRejectedByAdmin/' + fname + '/' + lname + '/' + email).then(function (response) {

                                    count = 0;
                                });
                            }
                            if (emailverified == undefined) {
                                emailverified = false;
                            }

                            if (isActive == undefined) {
                                isActive = false;
                            }
                            if (count == $scope.Manage_Users.length) {
                                $http.put('/ManageUserUpdate1/' + id + '/' + displayname + '/' + email + '/'
                                    + fname + '/' + lname + '/' + mobile + '/' + emailverified + '/'
                                    + status + '/' + isActive + '/' + UpdatedById).then(function (response) {
                                        count = 0;
                                        $scope.dataa = response.data;


                                    });
                                count = 0;
                            }
                            else {
                                $notify.warning('Warning', "Resource ID Already Exist");
                                count = 0;
                                return true;

                            }
                        }

                    }


                }
                refresh();
                $notify.success('Success', 'User is updated successfully');
                count = 0;
            }
            else {
                $notify.warning('Warning', "Resource ID Already Exist");

                count = 0;
                return "";

            }
        };



        /// get RoleName from Roles collection
        $http.get('/GetRoleNameFromRoleUI').then(function (response) {
            $scope.RoleNameValues = response.data;
        });





        // get user status from HCCartEstimationToolConfig.json file
        //User_Status  StatusName  StatusId
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').then(function (response) {


            $scope.UserStatusValues = response.data.User_Status;


        });


        $scope.showStatus = function (Manage_User) {
            var StatusSelected = [];
            if (Manage_User.IsApprovedByAdmin) {
                StatusSelected = $filter('filter')($scope.UserStatusValues, { StatusId: Manage_User.IsApprovedByAdmin });

            }
            if (StatusSelected == undefined) {

            }
            else {
                return StatusSelected.length ? StatusSelected[0].IsApprovedByAdmin : 'Pending';
            }
        };


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



        $scope.pagination =
            {
                current: 1
            };
        $scope.pageChanged = function () {
            alert($scope.currentPage + " is the current page.");
        }

        $scope.setCount = function () {
            $scope.resultCount = 100;
            $scope.currentPage = 3;
        }

        $scope.removeHighlight = function () {
            $(event.currentTarget).closest('form').find("td.highlighted").removeClass("highlighted");
        }
        var paginationCount = 0;
        var pagenumber = 0;

        $scope.applyHighlight = function ($data, index, pageNumber, id) {
            for (var i = 0; i < $scope.Manage_Users.length; i++) {
                if ($scope.Manage_Users[i]._id == id)
                    $scope.Manage_Users[i].DirtyFlag = "true";
            }
            var dataSpan = $(event.currentTarget).closest('td');
            if (!dataSpan.hasClass("highlighted")) {
                $(dataSpan).addClass("highlighted");
            }

            if (pagenumber == 0) {
                for (var i = 0; i < pagedata; i++) {

                    if ($scope.Manage_Users[i].DirtyFlag == "true") {
                        paginationCount++;
                    }
                }
            } else {
                var pagelength = pagenumber * (pagedata - 1);
                var pagelength1 = pagenumber * (pagedata - 5);
                for (var i = pagelength1; i < pagelength; i++) {

                    if ($scope.Manage_Users[i].DirtyFlag == "true") {
                        paginationCount++;
                    }
                }
            }

        }

        $scope.applyHighlightmail = function ($data, index, pageNumber, id) {

            for (var i = 0; i < $scope.Manage_Users.length; i++) {
                if ($scope.Manage_Users[i]._id == id) {
                    $scope.Manage_Users[i].DirtyFlagmail = "true";
                }
            }
            var dataSpan = $(event.currentTarget).closest('td');
            if (!dataSpan.hasClass("highlighted")) {
                $(dataSpan).addClass("highlighted");
            }
            if (pagenumber == 0) {
                for (var i = 0; i < pagedata; i++) {

                    if ($scope.Manage_Users[i].DirtyFlagmail == "true") {
                        paginationCount++;
                    }
                }
            } else {
                var pagelength = pagenumber * (pagedata - 1);
                var pagelength1 = pagenumber * (pagedata - 5);
                for (var i = pagelength1; i < pagelength; i++) {

                    if ($scope.Manage_Users[i].DirtyFlagmail == "true") {
                        paginationCount++;
                    }
                }
            }


        }

        $scope.applyHighlightResourceID = function ($data, index, pageNumber, id) {

            for (var i = 0; i < $scope.Manage_Users.length; i++) {
                if ($scope.Manage_Users[i]._id == id) {
                    $scope.Manage_Users[i].ResourceIDChk = "true";
                }
            }
            var dataSpan = $(event.currentTarget).closest('td');
            if (!dataSpan.hasClass("highlighted")) {
                $(dataSpan).addClass("highlighted");
            }

            if (pagenumber == 0) {
                for (var i = 0; i < pagedata; i++) {

                    if ($scope.Manage_Users[i].ResourceIDChk == "true") {
                        paginationCount++;
                    }
                }
            } else {
                var pagelength = pagenumber * (pagedata - 1);
                var pagelength1 = pagenumber * (pagedata - 5);
                for (var i = pagelength1; i < pagelength; i++) {

                    if ($scope.Manage_Users[i].ResourceIDChk == "true") {
                        paginationCount++;
                    }
                }
            }


        }
        $scope.applyHighlightRoleIDCheck = function ($data, index, pageNumber, id) {

            for (var i = 0; i < $scope.Manage_Users.length; i++) {
                if ($scope.Manage_Users[i]._id == id) {
                    $scope.Manage_Users[i].RoleIDCheck = "true";

                }
            }
            var dataSpan = $(event.currentTarget).closest('td');
            if (!dataSpan.hasClass("highlighted")) {
                $(dataSpan).addClass("highlighted");
            }
            if (pagenumber == 0) {
                for (var i = 0; i < pagedata; i++) {

                    if ($scope.Manage_Users[i].RoleIDCheck == "true") {
                        paginationCount++;
                    }
                }
            } else {
                var pagelength = pagenumber * (pagedata);
                var pagelength1 = pagenumber * (pagedata);
                for (var i = (pagelength1 - 5); i < (pagelength - 1); i++) {

                    if ($scope.Manage_Users[i].RoleIDCheck == "true") {
                        paginationCount++;
                    }
                }
            }


        }


        $scope.DeleteManageUser = function (id, email) {

            Userkeyid = id;
            emailid = email;
        };


        $scope.DeleteManageUserKey = function () {

            if (emailid == true) {
                $notify.warning('warning', 'Cannot delete the email verified user. If required, deactivate the user using the edit button.');
            }
            else {
                $http.delete('/DeleteUser/' + Userkeyid).then(function (response) {
                    $notify.success('Success', 'User is deleted successfully');
                    refresh();
                });
            }
        };



        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {
            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[1].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }







        //Custom Filter  for Role Name
        $scope.RoleNameFilter = function (data) {

            $scope.Role = data;
        };


        $scope.customRoleNameFilter = function (Manage_User) {

            if ($scope.Role == undefined) { return true }
            else {
                var Role_Name = $scope.showRoleName(Manage_User);
                return (Role_Name.toLowerCase().indexOf($scope.Role.toLowerCase()) !== -1);
            }
        };




        //Custom Filter  for Status
        $scope.StatusFilter = function (data) {

            $scope.Status = data;
        };


        $scope.customStatusFilter = function (Manage_User) {

            if ($scope.Status == undefined) { return true }
            else {
                var status = $scope.showStatus(Manage_User);
                return (status.toLowerCase().indexOf($scope.Status.toLowerCase()) !== -1);
            }
        };

        var pagedata = 0;
        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;

            pagedata = $scope.ItemsPerPageCount;
        });
        $scope.ItemsPerPageChange = function () {

            var e = document.getElementById("ItemsPerPageID");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount = ItemsPerPageID;

            refresh();

        }

        //Facility Mapping Code
        $scope.CheckFunctionFacility = function () {

            $http.get('/UserIDFromMappingtable').then(function (response) {
                $scope.GetUseridsFromFacilityMapping = response.data;
                for (let i = 0; i < $scope.Manage_Users.length; i++) {

                    var SelectStream = "";
                    var id = $scope.Manage_Users[i]._id;
                    var displayname = $scope.Manage_Users[i].UserName;
                    var status = $scope.Manage_Users[i].IsApprovedByAdmin;
                    var isActive = $scope.Manage_Users[i].IsActive;
                    var CurrentUserId = displayname;
                    if (isActive == true) {
                        if (status == 2) {
                            isActive = false;
                        }
                    }

                    if (isActive == false) {
                        SelectStream = "";
                        SelectStream = $filter('filter')($scope.GetUseridsFromFacilityMapping, { UserID: displayname });
                        //return  SelectStream[0].Assignedin;
                        if (SelectStream.length == 0) {

                        }
                        if (SelectStream.length != 0) {
                            for (let i = 0; i < $scope.GetUseridsFromFacilityMapping.length; i++) {
                                var CurrentUserId = displayname;
                                var displaynames = $scope.GetUseridsFromFacilityMapping[i].UserID;
                                var FacilityID = $scope.GetUseridsFromFacilityMapping[i].FacilityID;
                                if (displaynames == CurrentUserId) {
                                    var CurrentUserId = $scope.GetUseridsFromFacilityMapping[i]._id;
                                    $http.put('/UpdateFacilityMapping/' + CurrentUserId).then(function (response) {
                                    });
                                }
                            }
                            SelectStream = "";
                        }
                    }


                    if (isActive == true) {
                        var SelectStream = "";
                        SelectStream = $filter('filter')($scope.GetUseridsFromFacilityMapping, { UserID: displayname });
                        if (SelectStream.length == 0) {
                            $http.post('/SaveUserIDInFacility_UserMapping/' + CurrentUserId).then(function (response) {

                            });
                            SelectStream = "";
                        }
                        if (SelectStream.length != 0) {



                            for (let i = 0; i < $scope.GetUseridsFromFacilityMapping.length; i++) {
                                var CurrentUserId = displayname;
                                var displaynames = $scope.GetUseridsFromFacilityMapping[i].UserID;
                                var FacilityID = $scope.GetUseridsFromFacilityMapping[i].FacilityID;

                                if (displaynames == CurrentUserId) {
                                    var CurrentUserId = $scope.GetUseridsFromFacilityMapping[i]._id;
                                    $http.put('/UpdateUserIDInFacilityMapping/' + CurrentUserId).then(function (response) {

                                    });
                                }
                            }

                            SelectStream = "";
                        }

                    }





                }



            });
        }





    }]);