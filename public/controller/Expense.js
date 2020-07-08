

app.directive('decimalPlaces', function () {
    return {
        link: function (scope, ele, attrs) {
            ele.bind('keypress', function (e) {
                var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                if ($(this).val().search(/(.*)\.[0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
                    e.preventDefault();
                }
            });
        }
    };
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

app.controller('ExpenseCtrl', ['$scope', '$http', '$window', '$filter', '$cookieStore', '$notify', '$timeout', 'StoreService',
    function ($scope, $http, $window, $filter, $cookieStore, $notify, $timeout, StoreService) {


        var ExpenseID = '';
        var Date = '';
        $scope.AddResourcebtnShow = false;

        $scope.disalbed = false;
        $scope.headingShow = true;
        $scope.CopyToBtnShow1 = false;
        $scope.SaveBtnShow = false;
        $scope.Total = 0;
        var count = 0;

        var username = $cookieStore.get('LoggedinUser');

        var refreshsUpdate = function () {

            $http.get('/user/' + username).then(function (response) {
                var RoleID = response.data[0].Role;
                $http.get('/role/' + RoleID).then(function (response) {
                    $scope.role = response.data;
                    var access = $scope.role[0].UIList[4].View;
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

                $scope.ExpenseMonth = "";
                $scope.ResourceCosts = '';
                $scope.CommonCosts = "";
                $scope.ValueDivide = '';
                $scope.ExpenseType = {};
            }
            refresh();
            $scope.Total = 0;
        });
        FacilityService = $cookieStore.get('FacilityID1');
        $scope.value = StoreService;


        var refresh = function () {
            if (FacilityService == "" || FacilityService == undefined) {
                $scope.ShowBody = false;
                $scope.Showmessage = true;
                $scope.Message = "You are not authorized to view this page";
            }
            else {
                $scope.Message = "";
                $scope.ShowBody = true;
                $scope.Showmessage = false;
                $http.get('/PMSConfig/PMSCartEstimationToolConfig.json').success(function (data) {
                    $scope.ItemsPerPageCounts = data.ItemPerPage;
                    $scope.ItemsPerPageCount = $scope.ItemsPerPageCounts[0].PageID;
                    $scope.ExpenseTypes = data.ExpenseType;
                    //  $scope.ExpenseType = $scope.ExpenseTypes[0].ExpenseName;
                });
            }

        };

        refresh();

        $scope.refreshUI = function () {
            $scope.ResourceCosts;
        }

        var HideLoadingPanel = function () {

            function remove() {
                $("div#divLoading").removeClass('show');
            }
            setTimeout(remove, 1000);
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

        //****** Page Common Functions ***** //
        var getCommonCostsData = function (Month, Year) {
            $http.get('/getCommonCosts/' + Month + '/' + Year + '/' + FacilityService).then(function (response) {

                $scope.CommonCosts = response.data;
                if ($scope.CommonCosts.length != 0) {
                    $scope.ValueDivide = parseInt($scope.CommonCosts[0].DaysPA / 12);
                }
                $scope.SaveBtnShow = false;
            });

        };
        var getResourceExpenseData = function (Month, Year, ExpenseID) {
            if (ExpenseID == 'HRB' || ExpenseID == 'HRNB') {
                $scope.disalbed = false;
                $scope.AddResourcebtnShow = false;
                $scope.headingShow = true;
                $scope.CostData = '';
                $http.get('/getExpense/' + Month + '/' + Year + '/' + ExpenseID + '/' + FacilityService).then(function (response) {
                    $scope.CostData = response.data;
                    if ($scope.CostData == 0) {

                        $http.get('/UserResource123/' + FacilityService).then(function (response) {
                            ;
                            $scope.ResourceCosts = response.data;

                        });
                    } else {
                        $http.get('/UserResource123/' + FacilityService).then(function (response) {
                            ;
                            $scope.Total = 0;
                            $scope.ResourceCosts = response.data;

                            for (i = 0; i < $scope.CostData.length; i++) {
                                ;
                                for (j = 0; j < $scope.ResourceCosts.length; j++) {
                                    if ($scope.CostData[i].ResourceID == $scope.ResourceCosts[j]._id) {
                                        $scope.ResourceCosts[j].Amount = parseFloat(($scope.CostData[i].Amount).toFixed(2));
                                        $scope.Total += $scope.ResourceCosts[j].Amount;
                                    }
                                }

                            }

                        });
                    }
                });
            }
            else if (ExpenseID == 'NHR') {

                getNHRData(Month, Year, ExpenseID);
            }


        };




        var getAllExpensesTotalCost = function (Month, Year) {
            

            $http.get('/GettotalExpenseValues/' + Month + '/' + Year + '/' + FacilityService).then(function (response) {
                $scope.TotalExpenses1 = response.data;

                if ($scope.TotalExpenses1.length > 0) {
                    $scope.ttlexpns = $scope.TotalExpenses1[0].Amount;
                }


            });
        }

        var exportClckCount=0;
        $scope.GenerateLoadedCosts = function () 
        {
            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();

            var e = document.getElementById("ExpenseTypeID");
            ExpenseID = (e.options[e.selectedIndex].value).trim();
            if ($scope.textbox != "" && ExpenseID != "") {
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();
                getLoadedCostValue(Month, Year, ExpenseID);
            }
            if (ExpenseID == "HRB") 
            {
                $scope.showLoadedCost = true;
                exportClckCount++;
            }
            else {
                $scope.showLoadedCost = false;
            }
            //   else($scope.textbox == "" || ExpenseID=="" )
            //   {
            //        $notify.warning('Warning', "Please select Month and Expense Type");

            //    }


        }
        $scope.showLoadedCost = false;
        var getLoadedCostValue = function (Month, Year, ExpenseID) {
            
            $scope.TotalExpenses = 0;
            $scope.TotalExpenses1 = 0
            var HRNonHRBCost = 0;
            $scope.TotalBillableCost = 0;
            var LoadedCost = 0;
            var IndivualHrBillableCost = 0;
            $scope.ResourceSalary = 0;

            getResourceExpenseData(Month, Year);



            $http.get('/getTotalBillableExpense/' + Month + '/' + Year + '/' + FacilityService).then(function (response) {
                $scope.getTotalBillableExpense = response.data;

                $scope.LoadedCostDetails = [];

                if ($scope.getTotalBillableExpense.length > 0) {

                    for (f = 0; f < $scope.getTotalBillableExpense.length; f++) {
                        $scope.TotalBillableCost += $scope.getTotalBillableExpense[f].Amount;

                    }
                }
                $http.get('/getTotalExpense/' + Month + '/' + Year + '/' + ExpenseID + '/' + FacilityService).then(function (response) {
                    $scope.getTotalExpense = response.data;
                    $scope.LoadedCostValue = 0;
                    if ($scope.getTotalExpense.length > 0) {

                        for (e = 0; e < $scope.getTotalExpense.length; e++) {
                            var obj = {};
                            $scope.UserName = $scope.getTotalExpense[e].UserName;
                            $scope.Salary = $scope.getTotalExpense[e].Amount;

                            //get overall expenses total for all expense type
                            $scope.TotalExpenses = $scope.ttlexpns;
                            //get overall expenses total for all expense type
                            LoadedCost = ($scope.TotalExpenses / $scope.TotalBillableCost).toFixed(2);
                            //get indivual resource salary of the month and year
                            var monthVal = $scope.getTotalExpense[e].Month;
                            SelectResourceIDs = $filter('filter')($scope.getTotalBillableExpense, { UserName: $scope.UserName, Month: monthVal });
                            for (l = 0; l < SelectResourceIDs.length; l++) {

                                IndivualHrBillableCost = parseFloat(SelectResourceIDs[l].Amount).toFixed(2);
                                $scope.LoadedCostValue = LoadedCost * IndivualHrBillableCost;
                            }
                            obj.UserName = $scope.UserName;
                            obj.LoadedCostValue = $scope.LoadedCostValue;
                            $scope.LoadedCostDetails.push(obj);
                        }


                    }


                    //////////////////////  get distinct resource,  Loaded cost
                    var ref = {};
                    var res = $scope.LoadedCostDetails.reduce(function (arr, o) {
                        if (!(o.UserName in ref)) {
                            ref[o.UserName] = arr.length;
                            arr.push($.extend({}, o));

                        } else {
                            arr[ref[o.UserName]].LoadedCostValue = o.LoadedCostValue;

                        }
                        return arr;
                    }, []);

                    //bind loaded cost 

                    $scope.LCostValues = res;
                    for (i = 0; i < $scope.ResourceCosts.length; i++) {
                        var MainUsername = $scope.ResourceCosts[i].UserName;
                        var getloadedcost = $scope.LCostValues.filter(function (element) {
                            return element.UserName == MainUsername;
                        });
                        if (getloadedcost.length > 0) {
                            //  $scope.ResourceCosts[i].LoadedCostValue = getloadedcost[0].LoadedCostValue;


                            for (z = 0; z < getloadedcost.length; z++) {
                                $scope.ResourceCosts[i].LoadedCostValue = getloadedcost[z].LoadedCostValue;
                            }

                        }
                    }
                    //   console.log($scope.LCostValues);



                    //    LoadedCostsdffdsf=  $scope.TotalExpenses/$scope.TotalBillableCost * IndivualHrBillableCost;
                    //console.log  (LoadedCostsdffdsf)
                })
            });
        }

        var addExpenseData = function (Month, Year, ResourceType, Message) {
            
            $scope.Total = 0;
            for (i = 0; i < $scope.ResourceCosts.length; i++) {

                var Amount = parseFloat(($scope.ResourceCosts[i].Amount)) || 0;
                var sum = (Amount).toFixed(2);
              var  LoadCostval=parseFloat(($scope.ResourceCosts[i].LoadedCostValue)) || 0;
                var floatval = parseFloat(sum);
                $scope.ResourceCosts[i].ResourceID = $scope.ResourceCosts[i]._id;
                $scope.ResourceCosts[i].ResourceType = ResourceType;
                $scope.ResourceCosts[i].Month = Month;
                $scope.ResourceCosts[i].Year = Year;
                $scope.ResourceCosts[i].Amount = parseFloat((Amount).toFixed(2));
               $scope.ResourceCosts[i].LoadedCost = parseFloat((LoadCostval).toFixed(2));
                $scope.ResourceCosts[i].UpdatedById = username;
                $scope.ResourceCosts[i].FacilityID = FacilityService;

                $scope.Total += floatval;



            }

            $http.post('/AddExpense/' + Month + '/' + Year + '/' + ResourceType + '/' + FacilityService, $scope.ResourceCosts).then(function (response) {

                if (Message == "CopyToMonth") {
                    $notify.success('Success', "Resource Costs Copied to Selected Month Successfully");
                }
                else {
                    $notify.success('Success', "Resource Costs Saved Successfully");
                }
            });

        };

        var addCommonCostData = function (Month, Year, Message) {

            $scope.CommonCosts[0].DaysPA = parseInt($scope.CommonCosts[0].DaysPA) || 0;
            $scope.CommonCosts[0].ExchangeRate = parseFloat($scope.CommonCosts[0].ExchangeRate) || 0;
            $scope.CommonCosts[0].HoursPD = parseInt($scope.CommonCosts[0].HoursPD) || 0;
            $scope.CommonCosts[0].Month = Month;
            $scope.CommonCosts[0].Year = Year;
            $scope.CommonCosts[0].UpdatedById = username;
            $scope.CommonCosts[0].FacilityID = FacilityService;
            delete $scope.CommonCosts[0]._id;
            $http.post('/AddCommonCost/' + Month + '/' + Year + '/' + FacilityService, $scope.CommonCosts).then(function (response) {
                if (Message == "CopyToMonth") {
                    $notify.success('Success', "Common Costs Copied to Selected Month Successfully");
                    $scope.CopyToBtnShow1 = false;
                    $scope.CopyToBtnShow = true;
                }
                else {
                    $scope.SaveBtnShow = false;
                    $notify.success('Success', "Common Costs Saved Successfully");
                    $scope.CopyToBtnShow1 = false;
                    $scope.CopyToBtnShow = true;
                }
            });
        };

        $scope.CancelCopy = function () {
            $scope.CopyToBtnShow1 = false;
            document.getElementById("CopyToMonth").value = "";
        }
        var getNHRData = function (Month, Year, ExpenseID) {

            $scope.CostData = '';
            $scope.disalbed = false;
            $scope.AddResourcebtnShow = true;
            $scope.headingShow = true;
            $http.get('/getExpense/' + Month + '/' + Year + '/' + ExpenseID + '/' + FacilityService).then(function (response) {
                $scope.CostData = response.data;

                if ($scope.CostData == 0) {
                    $http.get('/getNHRResource' + '/' + FacilityService).then(function (response) {

                        $scope.ResourceCosts = response.data;
                        for (i = 0; i < $scope.ResourceCosts.length; i++) {
                            $scope.ResourceCosts[i].UserName = $scope.ResourceCosts[i].ResourceName;
                            delete $scope.ResourceCosts[i].ResourceName;
                        }
                    });
                } else {
                    $http.get('/getNHRResource' + '/' + FacilityService).then(function (response) {

                        $scope.ResourceCosts = response.data;
                        $scope.Total = 0;
                        for (i = 0; i < $scope.CostData.length; i++) {

                            for (j = 0; j < $scope.ResourceCosts.length; j++) {
                                if ($scope.CostData[i].ResourceID == $scope.ResourceCosts[j]._id) {
                                    $scope.ResourceCosts[j].Amount = parseFloat(($scope.CostData[i].Amount).toFixed(2));
                                    $scope.ResourceCosts[j].UserName = $scope.ResourceCosts[j].ResourceName;
                                    delete $scope.ResourceCosts[j].ResourceName;
                                    $scope.Total += $scope.ResourceCosts[j].Amount;
                                }
                            }
                        }
                        for (j = 0; j < $scope.ResourceCosts.length; j++) {
                            if ($scope.ResourceCosts[j].ResourceName != undefined) {
                                $scope.ResourceCosts[j].UserName = $scope.ResourceCosts[j].ResourceName;
                                delete $scope.ResourceCosts[j].ResourceName;
                            }
                        }

                    });

                }
            });
        }


        var savetoDBNHR = function (NonHRResource) {

            var e = document.getElementById("ExpenseTypeID");
            ExpenseID = (e.options[e.selectedIndex].value).trim();
            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
            var Year = parseInt($scope.textbox.split(" ")[1].trim());
            var Month = $scope.textbox.split(" ")[0].trim();
            NonHRResource.CreatedById = username;
            NonHRResource.FacilityID = FacilityService;
            var Namechk = '';

            Namechk = NonHRResource.ResourceName;
            for (var b = 0; b < $scope.ResourceCosts.length; b++) {
                var Namechk1 = $scope.ResourceCosts[b].UserName;
                if (Namechk.toUpperCase() == Namechk1.toUpperCase()) {
                    count++;
                }
            }

            if (count == 0) {
                $http.post('/SaveNHR' + '/' + FacilityService, NonHRResource).then(function (response) {
                    getNHRData(Month, Year, ExpenseID);
                });
                $scope.NonHRResource = '';
                count = 0;
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();
                //CommonCosts Load
                getCommonCostsData(Month, Year);
            }
            else {
                $notify.warning('Warning', "Resource Already Exist");
                count = 0;
                return '';

            }
            $notify.success('success', "Resource Created Successfully");
        }

        $scope.getdaymonth = function (data) {
            
            var data = document.getElementById("WorkingDaysPA").value;
            if (data == "") {
                data = 0;
                $scope.ValueDivide = parseInt(data / 12);
                $notify.warning('Warning', "value should be greater than 0");
                $scope.disalbed = true;
                return true
            }
            var data = parseInt(document.getElementById("WorkingDaysPA").value);

            if (data > 366) {
                $notify.warning('Warning', "value should be less than 366");
                $scope.disalbed = true;
                return true;
            }
            else if (data < 1 || data == NaN) {
                $notify.warning('Warning', "value should be greater than 0");
                $scope.disalbed = true;
                return true;
            }
            else {
                $scope.disalbed = false;

            }

            $scope.ValueDivide = parseInt(data / 12);
        }

        $scope.CheckWorkingHours = function (data) {

            var data = document.getElementById("WorkingHoursPD").value;
            if (data == "") {
                data = 0;

                $notify.warning('Warning', "Hours should be greater than 0");
                $scope.disalbed = true;
                return true
            }
            var data = parseInt(document.getElementById("WorkingHoursPD").value);
            if (data > 12) {
                $notify.warning('Warning', "Hours should be less than 12");
                $scope.disalbed = true;
                return true;
            }
            else if (data < 1 || data == NaN) {
                $notify.warning('Warning', "Hours should be greater than 0");
                $scope.disalbed = true;
                return true;
            }
            else {
                $scope.disalbed = false;
                return true;
            }


        }



        $scope.CheckExchangeRate = function (data) {

            var data = document.getElementById("ExchangeRate").value;
            if (data == "") {


                $notify.warning('Warning', "Exchange Rate should be greater than 0");
                $scope.disalbed = true;
                return true
            }
            var data = parseInt(document.getElementById("ExchangeRate").value);
            if (data > 99999) {
                $notify.warning('Warning', "Exchange Rate should be less than 99999");
                $scope.disalbed = true;
                return true;
            }
            else if (data < 1 || data == NaN) {
                $notify.warning('Warning', "Exchange Rate should be greater than 0");
                $scope.disalbed = true;
                return true;
            }
            else {
                $scope.disalbed = false;
                return true;
            }


        }
        var CopyDataToDBForMonth = function () {
            $scope.textbox = angular.element(document.getElementById("CopyToMonth")).val().trim();
            if ($scope.textbox != "") {
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();
                var e = document.getElementById("ExpenseTypeID");
                var ResourceType = (e.options[e.selectedIndex].value).trim();
                var Message = "CopyToMonth";
                //AddaddExpenseData
                addExpenseData(Month, Year, ResourceType, Message);
                //AddCommonCostData
                addCommonCostData(Month, Year, Message);
            }
            else {
                $scope.Total = 0;
                $notify.warning('Warning', "Please Select Month");
            }
        }

        //****** Page Common Functions ***** //



        $scope.ResourceLoad = function () {
            
          //  $scope.showLoadedCost = true;
            $scope.Total = 0;
            $scope.ValueDivide = "";
            if (FacilityService == "" || FacilityService == undefined) {
                $notify.warning('Warning', "Please Select any Office Location");

                $scope.ShowCopyButton = false;

            }
            else {
                $scope.ShowCopyButton = true;
                var e = document.getElementById("ExpenseTypeID");
                ExpenseID = (e.options[e.selectedIndex].value).trim();
                if (ExpenseID == "") {
                    $scope.Total = 0;
                    $scope.ResourceCosts = '';
                    $scope.CommonCosts[0] = "";
                    $scope.ValueDivide = "";
                    $scope.ShowCopyButton = false;
                }
                $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();


              

                if ($scope.textbox != "") 
                {
                    var Year = parseInt($scope.textbox.split(" ")[1].trim());
                    var Month = $scope.textbox.split(" ")[0].trim();
                    //CommonCosts Load
                    getCommonCostsData(Month, Year);
                    //Resource Table load
                    getResourceExpenseData(Month, Year, ExpenseID);
                    if (ExpenseID == "HRB") 
                    {
                        $scope.showLoadedCost = true;
                        getLoadedCostValue(Month, Year, ExpenseID);  //show the loadedcost value even when change the expense type again (29/12/2017)
                    }

                    getAllExpensesTotalCost(Month, Year);

                 //   getLoadedCostValue(Month, Year, ExpenseID);
               //     $scope.showLoadedCost = true;
                   //       GenerateLoadedCost(Month, Year, ExpenseID);
                }
                else {

                    $scope.Total = 0;
                    $notify.warning('Warning', "Please Select Month");
                }
            }
        }


        $scope.CopyToBtnShow123 = function () {



            var monthcheck = document.getElementById("ExpenseMonth").value;
            if (monthcheck == "") {
                $notify.warning('Warning', "Please Select Month");
                return '';
            }
            else {
                $scope.CopyToBtnhide = true;
                $scope.CopyToBtnShow1 = true;
            }

        }

        $scope.addNHRResource = function () {
            $scope.headingShow = false;
        }

        $scope.CopyDataToMonth = function () {
            
            var CheckExpenseType = document.getElementById("ExpenseTypeID").value;
            if (CheckExpenseType == "" || CheckExpenseType == undefined) {
                $notify.warning('Warning', "Please Select Expense Type");
                return true;
            }
            CopyDataToDBForMonth();
        }

        $scope.saveNHRResource = function () {
            savetoDBNHR($scope.NonHRResource);
        }
        $scope.CancelSavingResource = function () {
            $scope.headingShow = true;

        }
        $scope.ShowSaveBtn = function () {


            $scope.SaveBtnShow = true;

        }
        $scope.CheckMonthSelected = function () {
            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
            if ($scope.textbox != "" || $scope.textbox != undefined) {
                $scope.selectedOption = $scope.options[0];
            }
            else {
                $scope.Total = 0;
                $notify.warning('Warning', "Please Select Month");
            }
        }
        $scope.CancelClick = function () {
            ; var getmonth = document.getElementById("ExpenseMonth").value;

            $scope.SaveBtnShow = false;
            if (getmonth == '') {

            }
            else {
                $scope.CommonCosts = '';
                $scope.ValueDivide = '';
                $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();

                //CommonCosts Load
                getCommonCostsData(Month, Year);
            }
        }
        $scope.updateCommonCost = function () {


            

            var getmonth = document.getElementById("ExpenseMonth").value;

            if (getmonth == '') {
                $notify.warning('Warning', "Please Select Month");
                return '';
            }
            var WorkingDaysPA = parseInt(document.getElementById("WorkingDaysPA").value);

            var ExchangeRate = parseInt(document.getElementById("ExchangeRate").value);

            var WorkingHoursPD = parseInt(document.getElementById("WorkingHoursPD").value);

            if (isNaN(WorkingHoursPD)) {
                $notify.warning('Warning', "Please enter all the fields");
                return '';

            }

            if (isNaN(ExchangeRate)) {
                $notify.warning('Warning', "Please enter all the fields");
                return '';

            }

            if (isNaN(WorkingDaysPA)) {
                $notify.warning('Warning', "Please enter all the fields");
                return '';

            }

            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
            if ($scope.textbox != "" || $scope.textbox != undefined) {
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();
                //AddCommonCostData
                addCommonCostData(Month, Year);
            }
            else {
                $scope.Total = 0;
                $notify.warning('Warning', "Please Select Month");
            }
        }

        $scope.updateResourceCost = function () {
            ;
            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
            var Year = parseInt($scope.textbox.split(" ")[1].trim());
            var Month = $scope.textbox.split(" ")[0].trim();
            var e = document.getElementById("ExpenseTypeID");
            var ResourceType = (e.options[e.selectedIndex].value).trim();

//save loaded cost
            for (i = 0; i < $scope.ResourceCosts.length; i++) {
                var MainUsername = $scope.ResourceCosts[i].UserName;
                var getloadedcost = $scope.LCostValues.filter(function (element) {
                    return element.UserName == MainUsername;
                });
            if (getloadedcost.length > 0) {
                //  $scope.ResourceCosts[i].LoadedCostValue = getloadedcost[0].LoadedCostValue;


                for (z = 0; z < getloadedcost.length; z++) {
                 var   LoadCost = getloadedcost[z].LoadedCostValue;
                }

            }
        }
            if (Year != undefined && Month != undefined && ResourceType != undefined) {
                //AddaddExpenseData                
                addExpenseData(Month, Year, ResourceType);
            }
            else {
                $scope.Total = 0;
                $notify.warning('Warning', "Please Select Month and Expense Type");
            }

        }

        $scope.ItemsPerPageChange = function () {


            var e = document.getElementById("ItemsPerPageID");
            var ItemsPerPageID = parseInt(e.options[e.selectedIndex].value);

            $scope.ItemsPerPageCount = ItemsPerPageID;



        }
        $scope.ClearAll = function () {
            ;
            $scope.Total = 0;
            $scope.ResourceCosts = '';
            $scope.ExpenseType = {};
            $scope.CommonCosts = "";
            $scope.ValueDivide = "";
            $scope.textbox = angular.element(document.getElementById("ExpenseMonth")).val().trim();
            if ($scope.textbox != "") {
                var Year = parseInt($scope.textbox.split(" ")[1].trim());
                var Month = $scope.textbox.split(" ")[0].trim();
                //CommonCosts Load
                getCommonCostsData(Month, Year);


            }
        }


    }]);
