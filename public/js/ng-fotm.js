(function() {
    //Основной модуль игры
    var fotmApp = angular.module('fotm', [
        'ngRoute',
        'ngSanitize',
        'btford.socket-io',
        'ui.bootstrap',
        'cfp.hotkeys',
        'dnd',
        'gettext',
        'ngAudio',
        'chart.js',
        'angulartics',
        'angulartics.google.analytics']);

    // МАРШРУТИЗАЦИЯ
    fotmApp.config(function($locationProvider, $routeProvider) {
        //Скрытие # в адресной строке
        if(window.history && window.history.pushState){
            $locationProvider.html5Mode(true);
        }

        $routeProvider

            // маршрут для логина
            .when('/', {
                templateUrl : 'partials/login.ejs'
            })

            // маршрут для регистрации
            .when('/registration', {
                templateUrl : 'partials/registration.ejs'
            })

            // маршрут для выбора пати
            .when('/searchTeam', {
                templateUrl : 'partials/searchTeam.ejs'
            })

            // маршрут для создания пати
            .when('/createTeam', {
                templateUrl : 'partials/createTeam.ejs'
            })

            // маршрут для создания персонажа
            .when('/createChar', {
                templateUrl : 'partials/createCharacter.ejs'
            })

            // маршрут для города
            .when('/city', {
                templateUrl : 'partials/city.ejs'
            })

            // маршрут для информации о персонаже
            .when('/charInfo', {
                templateUrl : 'partials/charInfo.ejs'
            })

            // маршрут для инвентаря
            .when('/inventoryInfo', {
                templateUrl : 'partials/inventoryInfo.ejs'
            })

            // маршрут для способностей
            .when('/abilitiesInfo', {
                templateUrl : 'partials/abilitiesInfo.ejs'
            })

            // маршрут для арены
            .when('/arena', {
                templateUrl : 'partials/arena.ejs'
            })

            // маршрут для админки
            .when('/admin', {
                templateUrl : 'partials/admin.ejs'
            });

        $routeProvider.otherwise({redirectTo: '/'});
    });
})();

