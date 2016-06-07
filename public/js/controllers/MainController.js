(function(module) {
    //Главный контроллер
    module.controller("MainController", MainController);

    function MainController($scope, $rootScope, $window, $location, gettextCatalog, ngAudio, soundService) {
        gettextCatalog.setCurrentLanguage('en');
        ngAudio.performance=1000;

        $scope.soundService = soundService;

        //Блок обработки нажатия на кнопку <- в браузере
        $rootScope.$on('$locationChangeSuccess', function() {
            $rootScope.actualLocation = $location.path();
        });
        $rootScope.$watch(function () {return $location.path()}, function (newLocation) {
            if($rootScope.actualLocation === newLocation) {
                $window.location.href="/"; //выкидываем на логин скрин
            }
        });

        //Запрет на пользование строкой браузера
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if(!current && $location.path()!=="/")
            {
                $window.location.href="/"; //выкидываем на логин скрин
            }
        });

        $rootScope.changeLanguage = function (lang) {
            switch (lang) {
                case 'ru': gettextCatalog.setCurrentLanguage('ru');break;
                case 'en': gettextCatalog.setCurrentLanguage('en');break;
            }
        };

        $rootScope.toggleSound = function () {
            soundService.soundEnabled = !soundService.soundEnabled;
        };

        $rootScope.toggleMusic = function () {
            soundService.musicEnabled = !soundService.musicEnabled;
        };

        //Смена классов информационного div
            $scope.changeInfoCSS = function(cssScope){
            $scope.cssSuccess = false;
            $scope.cssError = false;
            $scope.cssText = false;
            switch(cssScope){
                case("success") : $scope.cssSuccess=true;break;
                case("error") : $scope.cssError=true;break;
                case("text") : $scope.cssText=true;break;
            }
        };
    }
})(angular.module("fotm"));