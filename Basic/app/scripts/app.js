'use strict';
angular
    .module('basic', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'pascalprecht.translate',
        'ngFileUpload',
        'isteven-multi-select',
        'dndLists',
        'ui.bootstrap',
        'ui-notification',
        'angularSpinner',
        'ngCookies',
        'ui.select',
        'toggle-switch',
        'cfp.hotkeys',
        'ui.bootstrap.datetimepicker',
        'angularMoment',
        'chart.js',
        'ui.router',
        'basic.routers',
        'basic.services',
        'ui.router.state.events',
        'angularFileUpload',
        'hc.marked',
        'ipCookie',
        'ui.codemirror'
    ])

    .config(['$translateProvider', '$windowProvider', function($translateProvider, $windowProvider) {
        let window = $windowProvider.$get();
        let lang = window.navigator.userLanguage || window.navigator.language;
        console.log('lang', lang);
        if (lang) {
            lang = lang.substr(0, 2);
            $translateProvider.preferredLanguage(lang);
        }
    }])
    .config(['NotificationProvider', 'usSpinnerConfigProvider', 'ChartJsProvider', function(NotificationProvider, usSpinnerConfigProvider, ChartJsProvider) {
        NotificationProvider.setOptions({
            delay: 10000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'bottom'
        });
        usSpinnerConfigProvider.setDefaults({ color: 'orange', radius: 0 });

        ChartJsProvider.setOptions({
            chartColors: ['#4da9ff', '#79d2a6', '#ff9900', '#ff704d', '#669999', '#4d0000']
        });
    }])
    .run(['$rootScope', '$location', '$http', '$cookies', function($rootScope, $location, $http, $cookies) {
        $rootScope.nowActive = 0;
        $rootScope.findWay = function() {
            $location.path('/explore');
        }
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            console.log('toState', toState.name);
            $rootScope.active = toState.name;
            $rootScope.username = $cookies.get('username');
        });

        //退出
        $rootScope.logout = () => {
            $location.path('/');
        };
        $rootScope.getUsername = () => {
            return $cookies.get('username');
        };
    }]);
