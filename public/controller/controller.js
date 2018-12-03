app.controller('IndexController', ['$scope', '$http', '$window', function ($scope, $http, $window) {

    $scope.message = "Hai Hello user !";
    $scope.messageregister = "Registration !";
     
    
   

   
   

     
    $scope.AddRole = function () {
   
        
        $http.post('/AddNewRole', $scope.Role).success(function (response) {
         //   

            refresh1();
        });
    };
	
  // ** Manage Cart Start ** 
 
	
	
	
  // ** Manage Cart End ** 
   
	
	





    $scope.remove = function (id) {
        console.log(id);
        if ($window.confirm("Are you sure to Delete")) {
            $http.delete('/contactdetail/' + id).success(function (response) {
                

                refresh();
            });
        } else {
            $scope.Message = "You clicked NO.";
        }

    };

    $scope.edit = function (id) {
       
        $http.get('/contactdetail/' + id).success(function (response) {
            $scope.contact = response;
        });
    };

    $scope.update = function () {
        
        $http.put('/contactdetail/' + $scope.contact._id, $scope.contact).success(function (response) {
            refresh();
        })
    };

 


    $scope.deselect = function () {
        $scope.contact = "";
        $scope.contactse = "";
    }


}]);



