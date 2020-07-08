 

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

app.controller('FacilityController', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', function ($scope, $http, $window, $filter, $cookieStore, $notify) {
    var refresh = function () {
        $http.get('/ViewFacility').then(function (response) {
            $scope.ViewFacilitys = response.data;

        });

        $scope.Facility = "";
        $scope.AssignFacility = "";
    };

    $http.get('/ViewFacility').then(function (response) {
        $scope.ViewFacilitys = response.data;

    });

    $scope.refreshUI = function () {
        refresh();
    };

    $scope.deselect = function () {
        $scope.Facility = "";
    }


    $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');
    var CreatedById = $scope.LoggedinUsers;
    var UpdatedById = $scope.LoggedinUsers;

    $scope.checkchanged = function (GetisActive) {
          
        if (GetisActive == false) {
            if ($scope.getfacilitybyuser.length != 0) {
                $notify.warning('Warning', "Office Location cannot be made inactive since it has Users Assigned to it");
                $scope.disableds = true;
                return true;

            }
        }
        else {
            $scope.disableds = false;
        }
    }


    $scope.checkfacilitybyuser = function (FacilityID) {
          
        $http.get('/Checkfacilitybyuser/' + FacilityID + '/' + username).then(function (response) {
            $scope.getfacilitybyuser = response.data;



        });

    }



    $scope.AddNewFacility = function () {
        var Countryid = document.getElementById('Countryid');
        var countryname1 = (Countryid.options[Countryid.selectedIndex].value);
        var Stateid = document.getElementById('Stateid');
        var statename1 = (Stateid.options[Stateid.selectedIndex].value);
        var Cityid = document.getElementById('Cityid');
        var cityname1 = (Cityid.options[Cityid.selectedIndex].value);



        $http.post('/AddNewFacility',
            {


                'FacilityName': $scope.Facility.FacilityName,
                'Address': $scope.Facility.Address,
                'Country': countryname1,
                'State': statename1,
                'City': cityname1,
                'IsActive': $scope.Facility.IsActive,
                'Region': $scope.Facility.Region,
                'Area': $scope.Facility.Area,
                'Postal_Code': $scope.Facility.Postal_Code,
                'Contact_Person': $scope.Facility.Contact_Person,
                'Contact_Email': $scope.Facility.Contact_Email,

                'CreatedById': CreatedById




            }).then(function (response) {

                $notify.success('Success', "New Office Location" + " '" + $scope.Facility.FacilityName + "' " + "is saved successfully");
                refresh();
                $scope.Facility = '';
                $scope.ViewCountryDetail = '';
                $scope.ViewStateDetail = '';
                $scope.ViewCityDetail = '';
            });

    };

    var FacilityNameChk = '';
    $scope.FacilityDuplicateCheck = function () {

        for (i = 0; i < $scope.ViewFacilitys.length; i++) {

            var FacilityNameChk = $scope.ViewFacilitys[i].FacilityName;
            if ($scope.Facility.FacilityName == FacilityNameChk) {
                $scope.disableds = true;

                $notify.warning('Warning', "Office Location Name" + " '" + FacilityNameChk + "' " + "is already exist ");
                break;
            }
            else {
                $scope.disableds = false;
            }
        }
    }





    $scope.TakeFacilityIDAndName = function (Facilityid, Facilityname) {


        $scope.SelectedFacility = Facilityid;
        $scope.SelectedFacilityName = Facilityname;

    }


    var GetUserMappingTable = function (id) {

        var facilityidValue = id;

        $http.get('/GetUserMappingTableValues/' + facilityidValue).then(function (response) {

            $scope.MainUserMappingTableValues = response.data;

        });

    }

    var FacilityidCount = 0;
    //Assign Facility Code
    $scope.GetFacilityId = function (id, FacilityName, Active) {

        GetUserMappingTable(id);

        var FaclityId = id;
        $scope.SelectedFacilityId = FaclityId;
        $scope.FacilityIsActive = Active;
        $scope.AssignUserFacilty = FacilityName;
        $scope.GetUserMappings = [];
        $http.get('/ViewUserAssignedToFacilitys/' + FaclityId).then(function (response) {
            $scope.GetUserMappingsMainDataWithFacility = response.data;
            $http.get('/ViewFacilityUser').then(function (response) {
                $scope.GetUserMappingsMainDataWithFacilityZero = response.data;

                if ($scope.GetUserMappingsMainDataWithFacility.length == 0) {
                    for (i = 0; i < $scope.GetUserMappingsMainDataWithFacilityZero.length; i++) {
                        var checkfacility = {};
                        var zeroUserID = $scope.GetUserMappingsMainDataWithFacilityZero[i].UserID;
                        var zeroIsActive = $scope.GetUserMappingsMainDataWithFacilityZero[i].IsActive;
                        checkfacility.UserID = zeroUserID;
                        checkfacility.IsActive = zeroIsActive;
                        checkfacility.FacilityID = FaclityId;
                        $scope.GetUserMappings.push(checkfacility);
                    }
                }

                else {
                    for (i = 0; i < $scope.GetUserMappingsMainDataWithFacilityZero.length; i++) {
                        var MainMappingID = $scope.GetUserMappingsMainDataWithFacilityZero[i]._id;
                        var zeroUserID = $scope.GetUserMappingsMainDataWithFacilityZero[i].UserID;
                        var zeroIsActive = $scope.GetUserMappingsMainDataWithFacilityZero[i].IsActive;
                        var FacilityID = $scope.GetUserMappingsMainDataWithFacilityZero[i].FacilityID;
                        FacilityidCount = 0;

                        for (j = 0; j < $scope.GetUserMappingsMainDataWithFacility.length; j++) {
                            var checkfacility = {};
                            var MappingID = $scope.GetUserMappingsMainDataWithFacility[j]._id;
                            var UserID = $scope.GetUserMappingsMainDataWithFacility[j].UserID;
                            var IsActive = $scope.GetUserMappingsMainDataWithFacility[j].IsActive;
                            var FacilityID = $scope.GetUserMappingsMainDataWithFacility[j].FacilityID;
                            if (zeroUserID == UserID) {
                                checkfacility._id = MappingID;
                                checkfacility.UserID = UserID;
                                checkfacility.IsActive = IsActive;
                                checkfacility.FacilityID = FacilityID;
                                $scope.GetUserMappings.push(checkfacility);
                                FacilityidCount = 1;
                            }
                        }

                        if (FacilityidCount == 0) {
                            checkfacility._id = MainMappingID;
                            checkfacility.UserID = zeroUserID;
                            checkfacility.IsActive = false;
                            checkfacility.FacilityID = FacilityID;
                            $scope.GetUserMappings.push(checkfacility);
                        }
                    }
                    
                }
            });
        });

    }




    // Popup Update Code in Assign Facility code
    var UpdateDuplicateCount = 0;
    $scope.saveAssignFacilityToUser = function () {
          
        var sdf = $scope.GetUserMappings;
        $scope.GetUserMappingsMainDataWithFacility;
        $scope.MainUserMappingTableValues;
        var facilityId = $scope.SelectedFacilityId;
        for (var i = 0; i < $scope.GetUserMappings.length; i++) {
            var id = $scope.GetUserMappings[i]._id
            var userid = $scope.GetUserMappings[i].UserID;
            var Isactive = $scope.GetUserMappings[i].IsActive;
            var FacilityID = $scope.GetUserMappings[i].FacilityID;
            UpdateDuplicateCount = 0;
            for (j = 0; j < $scope.MainUserMappingTableValues.length; j++) {

                var userisd = $scope.MainUserMappingTableValues[j].UserID;
                if (userid == userisd) {
                    UpdateDuplicateCount++;
                }

            }

            if (UpdateDuplicateCount > 1) {
                if (facilityId == FacilityID) {
                    $http.put('/UpdateFacilityUserMappingtable/' + id + '/' + facilityId + '/' + userid + '/' + Isactive).then(function (response) {
                    });
                }
            }


            else {

                $http.post('/SaveFacilityUserMappingtable/' + facilityId + '/' + userid + '/' + Isactive).then(function (response) {
                });
            }
        }
        $notify.success('Success', "User(s) assigned/unassigned to Office Location successfully");

  
        $http.get('/ViewUserAssignedToFacilitys/' + facilityId).then(function (response) {
            $scope.CheckAssignUsers = response.data;

            SelectStream1 = $filter('filter')($scope.CheckAssignUsers, {  IsActive: true });

            if (SelectStream1.length == 0) {
                FacilityService = $cookieStore.get('FacilityID1');
                if ( FacilityID == FacilityService) {
                    $cookieStore.remove('FacilityID1');
                    $cookieStore.remove("FacilityID");
                }
            }
        });

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



    $scope.applyHighlight = function ($data) {
        var dataSpan = $(event.currentTarget).closest('td');
        if (!dataSpan.hasClass("highlighted")) {
            $(dataSpan).addClass("highlighted");
        }
    }


    var username = $cookieStore.get('LoggedinUser');
    var refreshsUpdate = function () {
        $http.get('/user/' + username).then(function (response) {
            var RoleID = response.data[0].Role;

            $http.get('/role/' + RoleID).then(function (response) {
                $scope.role = response.data;
                var access = $scope.role[0].UIList[2].View;
                if (access == true) {
                    refresh();
                }
                else {
                    $window.location.href = '/Error.html'
                }
            })
        });
    }



    var FacilityID = '';
    $scope.UpdateManageFacility = function (FacilityId, CID, SID) {


        FacilityID = FacilityId;
        var CountryID = CID;
        var StateID = SID;
        $scope.ViewUpdateFacilityDetails = '';

        $http.get('/ViewStateDetails/' + CountryID).then(function (response) {
            $scope.ViewStateDetailsUpdates = response.data;

            $http.get('/ViewCityDetails/' + StateID).then(function (response) {
                $scope.ViewCityDetailsUpdate = response.data;
                $http.get('/ViewUpdateFacilityDetails/' + FacilityID).then(function (response) {
                    $scope.ViewUpdateFacilityDetails = response.data;

                });
            });
        });

    }

    $scope.FacilityDuplicateCheckForUpdate = function (UpdateFacilityName) {
          
        for (i = 0; i < $scope.ViewFacilitys.length; i++) {

            var UpdateFacilityNameChk = $scope.ViewFacilitys[i].FacilityName;
            if (UpdateFacilityName == UpdateFacilityNameChk) {

                if ($scope.SelectedFacilityName == UpdateFacilityName && $scope.SelectedFacility == $scope.SelectedFacility) {
                    $scope.disableds = false;
                    return '';
                }
                $scope.disableds = true;
                $notify.warning('Warning', "Office Location Name" + " '" + UpdateFacilityNameChk + "' " + "is already exist");
                break;
            }
            else {
                $scope.disableds = false;
            }
        }
    }

    $scope.UpdateFacilityValues = function () {
          



        var Countryid = document.getElementById('UpdateCountryid');
        var countryname1 = (Countryid.options[Countryid.selectedIndex].value);
        var Stateid = document.getElementById('UpdateStateid');
        var statename1 = (Stateid.options[Stateid.selectedIndex].value);
        var Cityid = document.getElementById('UpdateCityid');
        var cityname1 = (Cityid.options[Cityid.selectedIndex].value);

        var name = $scope.ViewUpdateFacilityDetails[0].FacilityName;
        var FacilityName = $scope.ViewUpdateFacilityDetails[0].FacilityName;
        var Address = $scope.ViewUpdateFacilityDetails[0].Address;
        if(Address==undefined||Address==""){
            Address="";
        }
        var Country = countryname1;
        var State = statename1;
        var City = cityname1;
        var IsActive = $scope.ViewUpdateFacilityDetails[0].IsActive;
        var Region = $scope.ViewUpdateFacilityDetails[0].Region;
        var Area = $scope.ViewUpdateFacilityDetails[0].Area;
        var Postal_Code = $scope.ViewUpdateFacilityDetails[0].Postal_Code;
        var Contact_Person = $scope.ViewUpdateFacilityDetails[0].Contact_Person;
        var Contact_Email = $scope.ViewUpdateFacilityDetails[0].Contact_Email;


        $scope.LoggedinUsers = $cookieStore.get('LoggedinUser');

        var UpdatedById = $scope.LoggedinUsers;
        $http.put('/UpdateFacilityValues',
            {
                'FacilityId': FacilityID,
                'FacilityName': FacilityName,
                'Address': Address,
                'Country': Country,
                'State': State,
                'City': City,
                'IsActive': IsActive,
                'Region': Region,
                'Area': Area,
                'Postal_Code': Postal_Code,
                'Contact_Person': Contact_Person,
                'Contact_Email': Contact_Email,

                'UpdatedById': UpdatedById
            }).then(function (response) {

                $notify.success('Success', 'Office Location is updated successfully');
                FacilityService = $cookieStore.get('FacilityID1');
                if (IsActive == false && FacilityID == FacilityService) {
                    $cookieStore.remove('FacilityID1');
                    $cookieStore.remove("FacilityID");
                }

                refresh();
                $scope.settrue = false;
            });
    };



    //Select Country Code

    var countryFunction = function () {
        $http.get('/ViewCountryDetails').then(function (response) {
            $scope.ViewCountryDetails = response.data;
        });

    };

    $scope.CountryChange = function (CountryID) {
        $scope.ViewUpdateFacilityDetails[0].State = "";
        $scope.ViewUpdateFacilityDetails[0].City = "";

        $http.get('/ViewStateDetails/' + CountryID).then(function (response) {
            $scope.ViewStateDetailsUpdates = response.data;
        });


        $http.get('/ViewCityDetails/' + StateID).then(function (response) {
            $scope.ViewCityDetailsUpdate = response.data;
        });

    };
    $scope.stateChange = function (StateID) {

        $scope.ViewUpdateFacilityDetails[0].City = "";
        $http.get('/ViewCityDetails/' + StateID).then(function (response) {
            $scope.ViewCityDetailsUpdate = response.data;
        });
    };


    //Select state Code
    var StateFunction = function () {
        $http.get('/SelectStateDetails').then(function (response) {
            $scope.selectStateDetails = response.data;
        });
    };

    //Select Country Code 
    var CityFunction = function () {
        $http.get('/SelectCityDetails').then(function (response) {
            $scope.selectCityDetails = response.data;
        });
    };



    //Custom Filter  for Country
    $scope.CountryNameFilter = function (data) {

        $scope.Country = data;
    };


    $scope.customCountryNameFilter = function (Manage_Facility) {

        if ($scope.Country == undefined) { return true }
        else {
            var countryName = $scope.showCountryName(Manage_Facility);
            return (countryName.toLowerCase().indexOf($scope.Country.toLowerCase()) !== -1);
        }
    };


    //Custom Filter  for State 
    $scope.StateNameFilter = function (data) {

        $scope.State = data;
    };


    $scope.customStateNameFilter = function (Manage_Facility) {

        if ($scope.State == undefined) { return true }
        else {
            var stateName = $scope.showStateName(Manage_Facility);
            return (stateName.toLowerCase().indexOf($scope.State.toLowerCase()) !== -1);
        }
    };



    //Custom Filter  for city 
    $scope.CityNameFilter = function (data) {

        $scope.City = data;
    };


    $scope.customCityNameFilter = function (Manage_Facility) {

        if ($scope.City == undefined) { return true }
        else {
            var cityName = $scope.showCityName(Manage_Facility);
            return (cityName.toLowerCase().indexOf($scope.City.toLowerCase()) !== -1);
        }
    };













    $scope.showCountryName = function (Manage_Facility) {
        var SelectStream1 = [];
        if (Manage_Facility.Country) {

            SelectStream1 = $filter('filter')($scope.ViewCountryDetails, { _id: Manage_Facility.Country });
        }
        return SelectStream1.length ? SelectStream1[0].CountryName : 'Select';
    };

    $scope.showStateName = function (Manage_Facility) {
        var SelectStream1 = [];
        if (Manage_Facility.State) {

            SelectStream1 = $filter('filter')($scope.selectStateDetails, { _id: Manage_Facility.State });
        }
        return SelectStream1.length ? SelectStream1[0].StateName : 'Select';
    };

    $scope.showCityName = function (Manage_Facility) {
        var SelectStream1 = [];
        if (Manage_Facility.City) {

            SelectStream1 = $filter('filter')($scope.selectCityDetails, { _id: Manage_Facility.City });
        }
        return SelectStream1.length ? SelectStream1[0].CityName : 'Select';
    };



    countryFunction();
    StateFunction();
    CityFunction();


    $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
          
        $scope.ItemsPerPageCounts = data.ItemPerPage;
        $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;
        $scope.ItemsPerPageCount1 = $scope.ItemsPerPageCounts[0].PageID;
    });
    $scope.ItemsPerPageChange = function () {
          

        $scope.ItemsPerPageCount;
        refresh();

    }

    $scope.ItemsPerPageChange1 = function () {
          

        $scope.ItemsPerPageCount1;
        refresh();

    }
    //Insert Cascading

    $scope.InsertCountryChange = function (CountryID) {

        $scope.ViewStateDetail = "";
        $scope.InsertCity = "";
        $http.get('/ViewStateDetails/' + CountryID).then(function (response) {
            $scope.ViewInsertStateDetails = response.data;
        });
    };


    $scope.InsertstateChange = function (StateID) {

        $http.get('/ViewCityDetails/' + StateID).then(function (response) {
            $scope.InsertViewCityDetails = response.data;
        });
    };


}]);