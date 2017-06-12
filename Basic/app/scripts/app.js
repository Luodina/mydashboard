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
    "isteven-multi-select",
    "dndLists",
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
    //'ui.router.state.events'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    var states = [
      {name: 'main', url: '/', templateUrl: "views/main.html", controller: 'MainCtrl'},

      {name: 'home', url: '/home', templateUrl: "views/dashboard.html"},
      {name: 'dataExplore',
        url: '/explore',
        templateUrl: 'views/dataExplore/dataExplore.html',
        controller: 'DataExploreCtrl'
      },
      {name: 'data', url: '/data/{name}', templateUrl: 'views/dataExplore/data.html', controller: 'DataCtrl'},
      {name: 'console.taskSchedule', url: '/schedule', templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl'},
      {name: 'console.settings', url: '/settings', templateUrl: 'views/settings.html', controller: 'SettingsCtrl'}
    ];
    // Loop over the state definitions and register them
    states.forEach(function (state) {
      $stateProvider.state(state);
    });
  })
  .config(['$translateProvider', '$windowProvider', function ($translateProvider, $windowProvider) {
    let window = $windowProvider.$get();
    let lang = window.navigator.userLanguage || window.navigator.language;
    console.log("lang", lang);
    if (lang) {
      lang = lang.substr(0, 2);
      $translateProvider.preferredLanguage(lang);
    }
  }])
  .config(['NotificationProvider','usSpinnerConfigProvider', '$httpProvider', 'ChartJsProvider', function (NotificationProvider, usSpinnerConfigProvider, $httpProvider, ChartJsProvider) {
    NotificationProvider.setOptions({
      delay: 10000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
    usSpinnerConfigProvider.setDefaults({color: 'orange', radius: 20});

    ChartJsProvider.setOptions({
      chartColors: ['#4da9ff','#79d2a6','#ff9900','#ff704d','#669999','#4d0000']
    });
  }])
  .run(['$rootScope', '$location', '$state', '$http','$cookies',  function ($rootScope, $location, $state, $http, $cookies ) {
      // $rootScope.$on('$stateChangeStart', function (event,toState) {
      //   console.log(toState.name);
      //   if(toState && toState.name === 'main'){
      //     $('#navbar-nav').css('visibility','hidden');
      //   }else{
      //     $('#navbar-nav').css('visibility','visible');
      //   }
      // })

    $rootScope.login = (username ,password) => {
      $http.post("/api/user/login/" ,{username,password}).success(function (user) {
        if (user.status) {
          console.log("LOGIN SUCCESS!");
          $cookies.put("username", username);
          $location.path("/home");
        } else {
          console.log("LOGIN FAILED!please, use login name:ocai and pass:123456");
        }
      }).error(function(err){
        $rootScope.message = err;
      });
    };
    $rootScope.getUsername = () => {
      return $cookies.get("username");
    };
    }])
    .service('buildLog', ['$uibModal', function ($uibModal) {
      this.open = function (tit,cont) {
        return $uibModal.open({
          backdrop: 'static',
          templateUrl: 'views/layer/dataExplore.html',
          // size: 'size',
          controller: ['$cookies','$scope','$filter','$uibModalInstance','$http',
            function ($cookies, $scope, $filter, $uibModalInstance, $http) {
              
              $scope.tit = $filter('translate')('web_common_data_explore_019');
              $scope.cont = $filter('translate')('web_common_data_explore_020');
              $scope.create = $filter('translate')('web_common_015');
              $scope.userName = $cookies.get("username");
              //$scope.go = function () {
                // if($scope.model.name !== undefined) {
                //   $http.post('/api/model/newModel', { 
                //     modelName:$scope.model.name, 
                //     userName: $scope.userName,
                //     viewOrCode: "01",
                //     menuID: "02",
                //   }).success(function(data){
                //       console.log("DataProcessingCtrl save:", data.msg);
                //   });
                // };
                //$uibModalInstance.dismiss();
              //};
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              }
            }]
        }).result;
      };

    }])
    .service('openPreview', ['$rootScope','$uibModal','$http','moment', function ($rootScope, $uibModal, $http, moment) {
    this.open = function (resultPreview, model) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/savePreview.html',
        // size: 'size',
        //controllerUrl: 'scripts/layer/savePreview.js',
        controller: ['$scope','$filter','$uibModalInstance',
          function ($scope,$filter,$uibModalInstance) {
            $scope.preTil = $filter('translate')('web_common_017');
            $scope.savebtn = $filter('translate')('web_common_018');
            $scope.resultPreview = resultPreview;
            $scope.model = model;
            $scope.model.USER_ID = $rootScope.getUsername();
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.model.UPDATED_TIME = moment()._d;
            console.log("GONNA BE POSTED:", $scope.model );
            $scope.save = function () {
              $http.get('/api/jupyter/step5').success(function(data){
                  console.log("DataProcessingCtrl save:", data.result);
              }).catch(function(err){
                  console.log("$http.get('/api/jupyter/step5') ERROR:", err);
              });
              if($scope.model !== undefined) {
                $http.post('/api/model/newModel', $scope.model).success(function(data){
                    console.log("DataProcessingCtrl save:", data.msg);
                }).catch(function(err){
                    console.log("$http.post('/api/model/newModel) ERROR:", err);
                });
              };
              $uibModalInstance.dismiss();
            };
          }]
      }).result;
    };

  }])
  .factory('dataExploreFactory', ['$resource', '$http', function($resource, $http){
    // var test =$resource('http://baidu.com/:news',{news:'@news'},{create:{method:'POST'}});
    // return test;
    return {
      getProjectList: function(){
        return $http.get('/api/model/getProjectList').success(function(data){
          // console.log("getProjectList:", data.model);  
        }); 
      }
    }
  }])
