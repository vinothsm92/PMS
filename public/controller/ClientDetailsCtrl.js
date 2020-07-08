 
var RolekeyVal = "";
var count = 0;
var NotifyCount = 0;
var FacilityService = '';
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

app.controller('ClientDetails', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


      
        var username = $cookieStore.get('LoggedinUser');
        var refreshsUpdate = function () {
              
            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;

                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[5].View;
                    if (access == true) {
                        refresh();
                    }
                    else {
                        $window.location.href = '/Error.html'
                    }
                })
            });
        }
        refreshsUpdate();
        //Facility DropDown Change Event
        $scope.$watch('value.storedObject', function (newVal) {
            if (newVal !== '') {
                FacilityService = newVal;
                refresh();
            }
        });
        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;


        var username = $cookieStore.get('LoggedinUser');

        $scope.phonenumber = function (inputtxt) {
              
            if (inputtxt == undefined) {

                $scope.phonenumbererrmsg = false;
                return true
            }
            var phonenumber = inputtxt.toString().length;

            if (phonenumber < 10) {

                $scope.phonenumbererrmsg = true;
            }
            else {
                $scope.phonenumbererrmsg = false;

                phonenumber = 0;
                return true;
            }
        }


        $scope.deselect = function () {
              
            $scope.clientdetails = "";
            $scope.Cilentform.$setPristine();

        }
        //Add ClientDetails
        $scope.AddClientDetails = function () {
               
            if (FacilityService == "" || FacilityService == undefined) {

                $notify.warning('warning', 'Please Select Office Location');

                return '';
            }

            try {
                $scope.clientdetails.UpdatedById = "null";
                if ($scope.clientdetails.Description == undefined || $scope.clientdetails.Description == null || $scope.clientdetails.Description == "") {
                    $scope.clientdetails.Description = "";
                }
                $http.post('/AddClientDetails/', {
                    'ClientName': $scope.clientdetails.ClientName,
                    'ContactPerson': $scope.clientdetails.ContactPerson,
                    'EmailID': $scope.clientdetails.EmailID,
                    'ClientLocation': $scope.clientdetails.ClientLocation,
                    'PhoneNumber': $scope.clientdetails.PhoneNumber,
                    'OtherInfo': $scope.clientdetails.Description,
                    'CreatedById': username,
                    'UpdatedById': $scope.clientdetails.UpdatedById,
                    'FacilityID': FacilityService,
                    'IsActive': true
                }).then(function (response) {
                    $notify.success('Success', 'Client ' + "'" + $scope.clientdetails.ClientName + "'" + ' Details Stored successfully');
                    $scope.clientdetails = "";
                    refresh();
                });
            } catch (error) {
                $notify.warning('warning', error);
            }
        }

        var refresh = function () {
            if (FacilityService == "" || FacilityService == undefined) {
                $scope.Showmessage = true;
                $scope.ShowBody = false;
            }
            else {
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $http.get('/GetClientDetails/' + FacilityService).then(function (response) {
                    $scope.ClientDetails = response.data;
                });
            }

        }





        //Update Duplicate
        $scope.UpdateDuplicate = function (CNAME) {

            for (i = 0; i < $scope.ClientDetails.length; i++) {                  
                var UpdateFacilityNameChk = $scope.ClientDetails[i].ClientName;
                if (CNAME == UpdateFacilityNameChk) {
                    if ($scope.GetClientName == CNAME && $scope.ClientID == $scope.ClientID) {
                        $scope.disableds = false;
                        return '';
                    }
                    $scope.disableds = true;
                    $notify.warning('Warning', "Facility Name" + " '" + UpdateFacilityNameChk + "' " + "is already exist");
                    break;
                }
                else {
                    $scope.disableds = false;
                }
            }


        }

        $scope.AddDuplicate = function (CNAME) {

            var AddDuplicate = 0;
            for (i = 0; i < $scope.ClientDetails.length; i++) {
                if (CNAME == $scope.ClientDetails[i].ClientName) {
                    AddDuplicate++;
                }
            }
            if (AddDuplicate != 0) {
                $notify.warning('warning', "Client " + "'" + CNAME + "'" + " already exist.");
                $scope.disableds = true;
            }
            else { $scope.disableds = false; }
        }
        //Delete Code
        $scope.DeleteCilentDetails = function (id) {
            DeleteClientMasterKey = id
        }
        $scope.DeleteClientKey = function () {
            var CID = DeleteClientMasterKey;
            $http.get('/GetCilentNamesDeleteCheck/' + CID).then(function (response) {
                $scope.GetCilentNames = response.data;
                if ($scope.GetCilentNames.length > 0) {
                    $notify.warning('warning', 'Project is allocated to this client. Customer Configuration cannot be deleted');
                } else {
                    $http.delete('/DeleteClientDetails/' + DeleteClientMasterKey).then(function (response) {
                        $notify.success('Success', 'Client Details is deleted successfully');
                        refresh();
                    });
                }

            });
        }

        //Update Code
        var ClientUpdateKey = '';
        $scope.EditClientClick = function (id, name) {
            ClientUpdateKey = id;
            $scope.ClientID = id;
            $scope.GetClientName = name;
            $http.get('/GetUpdateClientDetails/' + id + '/' + FacilityService).then(function (response) {
                $scope.UpdateClientDetails = response.data;
            });

        }

        $scope.UpdateClientData = function () {
              
            try {
                if ($scope.UpdateClientDetails[0].Description == undefined || $scope.UpdateClientDetails[0].Description == null || $scope.UpdateClientDetails[0].Description == "") {
                    $scope.UpdateClientDetails[0].Description = "";
                }
                $http.put('/UpdateClientDetails/', {
                    'id': ClientUpdateKey,
                    'ClientName': $scope.UpdateClientDetails[0].ClientName,
                    'ContactPerson': $scope.UpdateClientDetails[0].ContactPerson,
                    'EmailID': $scope.UpdateClientDetails[0].EmailID,
                    'ClientLocation': $scope.UpdateClientDetails[0].ClientLocation,
                    'PhoneNumber': $scope.UpdateClientDetails[0].PhoneNumber,
                    'OtherInfo': $scope.UpdateClientDetails[0].OtherInfo,
                    'UpdatedById': username,
                    'FacilityID': FacilityService,
                    'IsActive': true
                }).then(function (response) {
                    $notify.success('Success', 'Client ' + "'" + $scope.UpdateClientDetails[0].ClientName + "'" + ' Detail  updated successfully');
                    $scope.UpdateClientDetails = "";
                    refresh();
                });
            } catch (error) {

                $notify.warning('warning', error);

            }
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
        $scope.ShowBody = false;
        logincheck();

        $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
              
            $scope.ItemsPerPageCounts = data.ItemPerPage;
            $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;
            $scope.ListofMailid = data.Mail;

        });

        $scope.ItemsPerPageChange = function () {
              
            var e = document.getElementById("ItemsPerPageID");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount = ItemsPerPageID;

            refresh();

        }
        //cell color change

        $scope.removeHighlight = function () {
            $(event.currentTarget).closest('form').find("td.highlighted").removeClass("highlighted");
        }
        $scope.clear = function () {
            $scope.clientdetails = "";
            $scope.Cilentform.$setPristine();
        }

        $scope.applyHighlight = function ($data, index, pageNumber, id) {

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
