(function (module) {
    module.controller("FormController", FormController);

    //Контроллер форм
    function FormController($scope, $http, $location, $timeout, formLinkService, gettextCatalog) {

        //Если регистрация прошла успешно, то на форме login появится сообщение
        if(formLinkService.getIsReg()){
            $scope.changeInfoCSS("text"); //применяем ng-class
            $scope.info = gettextCatalog.getString("Now you can log in");
            formLinkService.setIsReg(false);
        }

        //Обработчик формы логина
        $scope.submitLogin = function(item, event) {
            var dataObject = {
                username : $scope.username,
                password : $scope.password
            };

            var response = $http.post("/login", dataObject, {});
            response.success(function(data, status, headers, config) {
                var serverTime=new Date(data.serverTime);
                var localTime=new Date();

                $scope.changeInfoCSS("success"); //применяем ng-class
                $scope.info=gettextCatalog.getString("Welcome!");
                $timeout(function(){
                    $location.path('/searchTeam');
                }, 10);
            });
            response.error(function(data, status, headers, config) {
                $scope.changeInfoCSS("error"); //применяем ng-class
                var error;
                if(data==="Password incorrect") {
                    error=gettextCatalog.getString("Password incorrect");
                }
                else if (data==="User not found") {
                    error=gettextCatalog.getString("User {{username}} not found", { username: $scope.username});
                }
                $scope.info=error;
                $scope.loginForm.$submitted=false;
            });
        };

        //Обработчик формы регистрации
        $scope.submitRegistration = function(item, event) {
            var dataObject = {
                username : $scope.username,
                email  : $scope.email,
                password : $scope.password
            };

            var response = $http.post("/registration", dataObject, {});
            response.success(function(data, status, headers, config) {
                $scope.changeInfoCSS("success"); //применяем ng-class
                $scope.info=gettextCatalog.getString("Registration successful");
                $timeout(function(){
                    formLinkService.setIsReg(true);
                    $location.path('/');
                }, 10);
            });
            response.error(function(data, status, headers, config) {
                $scope.changeInfoCSS("error"); //применяем ng-class
                var error;
                if(data==="User is already created") {
                    error=gettextCatalog.getString("User is already created");
                }
                else if (data==="This e-mail is in use") {
                    error=gettextCatalog.getString("This e-mail is in use");
                }
                $scope.info=error;
                $scope.registerForm.$submitted=false;
            });
        };

        //Отмена регистрации
        $scope.cancelRegistration = function(item, event) {
            formLinkService.setIsReg(false);
            $location.path('/');
        };

        $scope.testCounter=0;

        $scope.upCount = function(){
            $scope.testCounter++;
        };

        $scope.downCount = function(){
            $scope.testCounter--;
        };
    }

    //Сервис для связи форм логина и регистрации
    module.service('formLinkService', function() {
        var isRegistered = false;
        var wrongTime = false;
        return {
            setIsReg: function (isReg) {
                isRegistered = isReg;
            },
            getIsReg: function () {
                return isRegistered;
            }
        }
    });
})(angular.module("fotm"));


