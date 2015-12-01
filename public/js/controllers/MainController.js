//Главный контроллер
angular.module('fotm').controller("MainController", ["$scope", '$rootScope', '$window', '$location', 'gettextCatalog', 'ngAudio', MainController]);

function MainController($scope, $rootScope, $window, $location, gettextCatalog, ngAudio) {
    gettextCatalog.setCurrentLanguage('en');
    $rootScope.soundEnabled=true;
    ngAudio.performance=1000;

    //Музыка
    $rootScope.cityAmbience = ngAudio.load("sounds/music/city.mp3");
    $rootScope.cityAmbience.play();
    $rootScope.cityAmbience.loop = true;
    $rootScope.cityAmbience.volume=0.2;

    $rootScope.battleAmbience = ngAudio.load("sounds/music/grass.mp3");

    //Блок обработки нажатия на кнопку <- в браузере
    $rootScope.$on('$locationChangeSuccess', function() {
        $rootScope.actualLocation = $location.path();
    });
    $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
        if($rootScope.actualLocation === newLocation) {
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
        if($rootScope.soundEnabled) {
            $rootScope.soundEnabled = false;
            ngAudio.mute();
        }
        else {
            $rootScope.soundEnabled = true;
            ngAudio.unmute();
        }
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

    //Форматтер для различных названий
    //$scope.capitalize = function (str, lower) {
    //    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    //};
}



/*

angular.module('fotm').directive('svgIcon', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            src: '@',
            color: '@'
        },
        template: "<div class='btn btn-primary' ng-style='{&quot;background-image&quot;: &quot;{{src}}&quot; }'></div>",
        link: function(scope, element, attrs) {

        }
    }
});

angular.module('fotm').directive('iconRadioGroup', function() {
    return {
        restrict: 'E',
        scope: { model: '=', options: '=', value: '=', src: '=', color: '=' },
        controller: function($scope) {
            $scope.activate = function (option, $event) {
                $scope.model = option[$scope.value];
                // stop the click event to avoid that Bootstrap toggles the "active" class
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
                if ($event.preventDefault) {
                    $event.preventDefault();
                }
                $event.cancelBubble = true;
                $event.returnValue = false;
            };

            $scope.isActive = function(option) {
                return option[$scope.value] == $scope.model;
            };

            $scope.getValue = function (option) {
                return option[$scope.value];
            };

            $scope.getSrc = function (option) {
                return option[$scope.src];
            };

            $scope.getColor = function (option) {
                return option[$scope.color];
            };
        },
        template: "<svg-icon class='svg-icon-small' " +
        "ng-class='{active: isActive(option)}'" +
        "src={{getSrc(option)}} "+
        "color={{getColor(option)}} "+
        "ng-repeat='option in options' " +
        "ng-click='activate(option, $event)' " +
        "data-toggle='tooltip' data-placement='left' title={{getValue(option)}}>" +
        "</svg-icon>"
    };
});

*/
