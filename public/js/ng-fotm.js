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
    fotmApp.config(['$locationProvider', '$routeProvider', '$controllerProvider', '$compileProvider','$filterProvider','$provide', function($locationProvider, $routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
        //это функция регистрации компонентов для их динамической загрузки
        fotmApp.register =
        {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };

        //Эта функция динамически подгружает контроллеры через resolve у провайдера
        fotmApp.resolveScriptDeps = function(dependencies){
            return function($q,$rootScope){
                var deferred = $q.defer();
                $script(dependencies, function(){
                    // all dependencies have now been loaded by $script.js so resolve the promise
                    if ($rootScope.$$phase) return deferred.resolve();
                    $rootScope.$apply(function()
                    {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            }
        };

        //Скрытие # в адресной строке
        if(window.history && window.history.pushState){
            $locationProvider.html5Mode(true);
        }

        $routeProvider

            // маршрут для логина
            .when('/', {
                templateUrl : 'partials/login.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps('js/controllers/FormController.js')}
            })

            // маршрут для регистрации
            .when('/registration', {
                templateUrl : 'partials/registration.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps('js/controllers/FormController.js')}
            })

            // маршрут для выбора пати
            .when('/searchTeam', {
                templateUrl : 'partials/searchTeam.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps('js/controllers/SearchTeamController.js')}
            })

            // маршрут для создания пати
            .when('/createTeam', {
                templateUrl : 'partials/createTeam.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps('js/controllers/CreateTeamController.js')}
            })

            // маршрут для создания персонажа
            .when('/createChar', {
                templateUrl : 'partials/createCharacter.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/CreateCharacterController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/characterService.js'])}
            })

            // маршрут для города
            .when('/city', {
                templateUrl : 'partials/city.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/CityController.js',
                    'js/services/soundService.js',
                    'js/services/randomService.js',
                    'js/services/characterService.js'])}
            })

            // маршрут для информации о персонаже
            .when('/charInfo', {
                templateUrl : 'partials/charInfo.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/CharInfoController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/soundService.js',
                    'js/factories/character.js',
                    'js/services/arenaService.js'
                ])}
            })

            // маршрут для инвентаря
            .when('/inventoryInfo', {
                templateUrl : 'partials/inventoryInfo.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/InventoryInfoController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/soundService.js',
                    'js/factories/character.js',
                    'js/services/arenaService.js'
                ])}
            })

            // маршрут для способностей
            .when('/abilitiesInfo', {
                templateUrl : 'partials/abilitiesInfo.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/AbilitiesInfoController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/soundService.js',
                    'js/factories/character.js',
                    'js/services/arenaService.js'
                ])}
            })

            // маршрут для арены
            .when('/arena', {
                templateUrl : 'partials/arena.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/ArenaController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/soundService.js',
                    'js/factories/character.js',
                    'js/services/arenaService.js'
                    ])}
            })

            // маршрут для арены
            .when('/admin', {
                templateUrl : 'partials/admin.ejs',
                resolve: {deps: fotmApp.resolveScriptDeps([
                    'js/controllers/AdminController.js',
                    'js/services/randomService.js',
                    'js/services/effectService.js',
                    'js/services/abilityService.js',
                    'js/services/soundService.js',
                    'js/factories/character.js',
                    'js/services/arenaService.js'
                ])}
            });

        $routeProvider.otherwise({redirectTo: '/'});

        //Декоратор для правильной работы полосок здоровья
        var progressDecorator = function($delegate) {
            var directive = $delegate[0];
            var compile = directive.compile;
            var link = directive.link;

            directive.compile = function() {
                compile.apply(this, arguments);

                return function(scope, elem, attr, ctrl) {
                    link.apply(this, arguments);

                    if(angular.isDefined(attr.dynamicMax)) {
                        attr.$observe('dynamicMax', function(max) {
                            scope.max = max;
                            scope.percent = +(100 * scope.value / max).toFixed(2);
                        });
                    }

                };
            };

            return $delegate;
        };
        $provide.decorator('progressbarDirective', progressDecorator);
        $provide.decorator('barDirective', progressDecorator);
    }]);
})();

