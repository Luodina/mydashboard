
'use strict';
angular.module('basic.services', ['ui.bootstrap'])
  .service('createModel', ['$uibModal', function ($uibModal) {
    this.open = function (index) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: ['$location','$cookies', '$scope', '$filter', '$uibModalInstance', '$http',
          function ($location, $cookies, $scope, $filter, $uibModalInstance, $http) {
            $scope.title = $filter('translate')('modelType_0'+index);
            $scope.content = $filter('translate')('modelType_0'+index);

            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
            $scope.create = () => {
              if($scope.model.name !== undefined && $scope.model.name !== null) {
                //check in DB APP
                $http.get('/api/model/' + $scope.model.name).success((data) => {
                  if (data.result !== null){
                    $scope.model.name = '';
                    $scope.model.nameTip = 'Warning!';
                  } else {
                    $location.path('/explore/0' + index +'/new/'+$scope.model.name);
                    $uibModalInstance.dismiss();
                  }
                })
                .catch(err=>{console.log(err)});
              }
            }
          }]
      }).result;
    };
  }])
  .service('createApp', ['$uibModal', function ($uibModal) {
    this.open = () => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: [ '$rootScope', '$location', '$scope', '$filter', '$uibModalInstance', '$http',
          ($rootScope, $location, $scope, $filter, $uibModalInstance, $http) => {
            //$scope.title = 'Title';//$filter('translate')(obj.title)
            $scope.title = $filter('translate')('web_common_data_app_layer_01')
            //$scope.content = 'Content';//$filter('translate')(obj.content);
            $scope.content = $filter('translate')('web_common_data_app_layer_02');
            $scope.url = 'app';
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };

            $scope.create = function () {
              if($scope.model.name !== undefined && $scope.model.name !== null) {
                //check in DB APP
                $http.get('/api/app/' + $scope.model.name).success((data) => {
                    if (data.result !== null){
                      $scope.model.name = '';
                      $scope.model.nameTip = 'Warning!';
                    } else {
                      $http.get('/api/appFile/'+$scope.model.name).success((data) => {
                        if (data.result = 'success'){
                          $http.post('/api/app/' + $scope.model.name, {APP_NAME: $scope.model.name, USER_NAME: $rootScope.getUsername()})
                          .success((data) => {
                            $location.path('/app/new/'+$scope.model.name);
                            $uibModalInstance.dismiss();
                          });
                        }
                      })
                      .catch(err=>{console.log(err)});
                    }
                });
              };
            };
          }]
      }).result;
    };
  }])
  .service('openPreview', ['$uibModal', '$http', function ($uibModal, $http) {
    this.open = function (resultPreview) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/savePreview.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance', '$location', '$cookies',
          function ($scope, $uibModalInstance, $location, $cookies) {
            $scope.resultPreview = resultPreview;
            $scope.save = function () {
              $http.get('/api/jupyter/save').success(function (data) {
                let date = new Date();
                let savaData = {
                  MODEL_NAME: $location.path().split(/[\s/]+/).pop(),
                  MODEL_INFO: data.modelInfo,
                  USER_ID: $cookies.get('username'),
                  TYPE_MENU_ID: '01',
                  VIEW_MENU_ID: '01',
                  UPDATED_TIME: date.getTime(),
                  FILE_PATH: data.dataFileName,
                  NOTEBOOK_PATH: data.notebookPath,
                  COMMENT: 'Lets try it!',
                };
                $http.post('/api/model/new', savaData).success(function (data) {
                  $location.path('/explore');
                  console.log('MAKEFILE save:', data.msg);
                  $uibModalInstance.close(data.msg);
                });
              });
              $uibModalInstance.dismiss();
            };
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }]
      }).result;
    };
  }])
  .service('createAppModel', ['$uibModal', function ($uibModal) {
    this.open = function (appName) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createAppModel.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance', '$filter', '$state', '$location',
          function ($scope, $uibModalInstance, $filter, $state, $location) {
            $scope.items = [
              {img:'pic1',content:'modelType_01',url:'data',name:'data',isActive:false},
              {img:'pic2',content:'modelType_02',url:'t1',name:'data2',isActive:false},
              {img:'pic3',content:'modelType_03',url:'t2',name:'data3',isActive:false},
              {img:'pic4',content:'modelType_04',url:'t3',name:'data4',isActive:false},
              {img:'pic5',content:'modelType_05',url:'t4',name:'data5',isActive:false},
              {img:'pic6',content:'modelType_06',url:'notebook',name:'notebook',isActive:false}
            ]
            $scope.items[0].isActive=true;
            $scope.urlcontent = $scope.items[0];
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            }
            $scope.changeStyle = function(idx){
              angular.forEach($scope.items, function (item, i) {
                item.isActive = false;
              });
              $scope.items[idx].isActive=true;
              $scope.urlcontent = $scope.items[idx];
              console.log('312312',$scope.urlcontent);
            }
            $scope.create = function () {
              if($scope.model.name !== undefined && $scope.model.name !== null) {
                $uibModalInstance.dismiss();
                $location.path('/'+ appName +'/0'+ $scope.model.type + '/new/' + $scope.model.name);
              }
            };
          }]
      }).result;
    };
  }])
  .service('createArrange', ['$uibModal', function ($uibModal) {
    this.open = (targetNameList, modelNameList, appName, makeFileName) => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createArrange.html',
        size: 'size',
        controller: ['$cookies', '$scope', '$filter', '$uibModalInstance', '$http',
          ($cookies, $scope, $filter, $uibModalInstance, $http) => {
            let opts = [];
            $scope.appName = appName;
            $scope.makeFileName = makeFileName;
            $scope.data = {
              targetModel: null,
              prereqModel: [],
              targetModelOptions: targetNameList,
              prereqModelOptions: [[]],
            };
            function makeOptions(tmp, prereqModelTmp){
              return tmp.filter( option => {
                return !prereqModelTmp.includes(option);
              } );
            }
            $scope.makePrereqOptions = target => {
              $scope.data.prereqModel = [];
              $scope.data.prereqModelOptions =[[]];
              opts = makeOptions(modelNameList, [target]);
              $scope.data.prereqModelOptions[0] = opts;
            };
            $scope.action = index => {
              let vartmp = $scope.data.prereqModelOptions;
              if (index === $scope.data.prereqModelOptions.length - 1 && $scope.data.prereqModelOptions.length !== modelNameList.length-1) {
                let tmp = makeOptions(opts, Object.values($scope.data.prereqModel));
                $scope.data.prereqModelOptions[index+1] = tmp;
              }else {
                $scope.data.prereqModelOptions.splice(index,1);
                $scope.data.prereqModelOptions.map(arr => {
                  if (!arr.includes($scope.data.prereqModel[index])) {arr.push($scope.data.prereqModel[index]);}
                });
                $scope.data.prereqModel.splice(index,1);
              }
            };
            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
            $scope.save = () => {
              let savaData = {
                    MAKEFILE_ID: $scope.makeFileName,
                    USER_ID: $cookies.get("username"),
                    APP_ID: $scope.appName,
                    TARGET: $scope.data.targetModel,
                    PREREQUISITES: Object.values($scope.data.prereqModel).join(' ')
                  };
              $http.post('/api/appMakeFile/new', savaData).success((data)=> {
                console.log('MAKEFILE save:', data.msg);
                $uibModalInstance.close(data.msg);
              });
            };
          }]
      })
      .result;
    };
  }])
  .service('createTaskPlan', ['$uibModal', function ($uibModal) {
    this.open = function (createOrEdit,editSchedule) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createTaskPlan.html',
        size: 'size',
        controller: ['$cookies', '$scope', '$filter', '$uibModalInstance', '$http',
          function ($cookies, $scope, $filter, $uibModalInstance, $http) {
            $scope.schedule=null;
            createOrEdit =='edit'?$scope.schedule=editSchedule:$scope.schedule;
            createOrEdit =='edit'?$scope.isEdit=true:$scope.isEdit=false;
            $scope.isPause=false;
            //计划设置1
            $scope.grids = {
              changestatus:'每周',
              status:[{name:'每天'},{name:'每月'},{name:'每周'}]
            };

            //每周设置
            $scope.weeks = {
              changestatus:'周一',
              status:[{name:'周一'},{name:'周二'},{name:'周三'},{name:'周四'},{name:'周五'},{name:'周六'},{name:'周日'}]
            };
            console.log('1111',$scope.weeks);
            //每月设置
            $scope.months = {
              changestatus:'1',
              status:[{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'},{name:'10'},{name:'11'}
                ,{name:'12'},{name:'13'},{name:'14'},{name:'15'},{name:'16'},{name:'17'},{name:'18'},{name:'19'},{name:'20'},{name:'21'},{name:'22'},{name:'23'}
                ,{name:'24'},{name:'25'},{name:'26'},{name:'27'},{name:'28'},{name:'29'},{name:'30'},{name:'31'}]
            };

            //每小时设置
            $scope.hours = {
              changestatus:'0',
              status:[{name:'0'},{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'},{name:'10'},{name:'11'}
                ,{name:'12'},{name:'13'},{name:'14'},{name:'15'},{name:'16'},{name:'17'},{name:'18'},{name:'19'},{name:'20'},{name:'21'},{name:'22'},{name:'23'}
               ]
            };

            //每分钟设置
            $scope.minutes = {
              changestatus:'0',
              status:[{name:'0'},{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'},{name:'10'},{name:'11'}
                ,{name:'12'},{name:'13'},{name:'14'},{name:'15'},{name:'16'},{name:'17'},{name:'18'},{name:'19'},{name:'20'},{name:'21'},{name:'22'},{name:'23'}
                ,{name:'24'},{name:'25'},{name:'26'},{name:'27'},{name:'28'},{name:'29'},{name:'30'},{name:'31'},{name:'32'},{name:'33'},{name:'34'},{name:'35'},{name:'36'}
                ,{name:'37'},{name:'38'},{name:'39'},{name:'40'},{name:'41'},{name:'42'},{name:'43'},{name:'44'},{name:'45'},{name:'46'},{name:'47'},{name:'48'},{name:'49'},{name:'50'}
                ,{name:'51'},{name:'52'},{name:'53'},{name:'54'},{name:'55'},{name:'56'},{name:'57'},{name:'58'},{name:'59'}
              ]
            };

            //初始值
            $scope.grids.changestatus='每天';
            $scope.isWeekOk=false;
            $scope.isMonthOk=false;
            $scope.$watch('grids.changestatus', function (n, o) {
              if (n === o) {
                return;
              }
              if (n === '每天') {
                $scope.isWeekOk=false;
                $scope.isMonthOk=false;
              }
              if (n === '每周') {
                $scope.isWeekOk=true;
                $scope.isMonthOk=false;
              }
              if (n === '每月') {
                $scope.isWeekOk=false;
                $scope.isMonthOk=true;
              }
            });
            // if edit,the schedule_name can not change
            if(createOrEdit =='edit'&&editSchedule){
              editSchedule.HOUR?$scope.hours.changestatus = editSchedule.HOUR:$scope.hours.changestatus=0;
              editSchedule.HOUR?$scope.minutes.changestatus = editSchedule.MINUTE:$scope.minutes.changestatus=0;
              editSchedule.STATE =="RUNNING"?$scope.isPause=false:$scope.isPause=true;
              if(editSchedule.DATE){
                 $scope.grids.changestatus="每月";
                 $scope.isWeekOk=false;
                 $scope.isMonthOk=true;
                 $scope.months.changestatus=editSchedule.DATE;
               }else if(editSchedule.DAYOFWEEK){
                 $scope.grids.changestatus='每周';
                 $scope.isWeekOk=true;
                 $scope.isMonthOk=false;
                 editSchedule.DAYOFWEEK === 1 ? editSchedule.DAYOFWEEK ='周一' : editSchedule.DAYOFWEEK == 2 ? editSchedule.DAYOFWEEK ='周二': editSchedule.DAYOFWEEK == 3 ? editSchedule.DAYOFWEEK ="周三" : editSchedule.DAYOFWEEK == 4 ? editSchedule.DAYOFWEEK ='周四' : editSchedule.DAYOFWEEK == 5 ? editSchedule.DAYOFWEEK ='周五' : editSchedule.DAYOFWEEK == 6 ? editSchedule.DAYOFWEEK ='周六' : editSchedule.DAYOFWEEK == 7 ? editSchedule.DAYOFWEEK ='周日' :editSchedule.DAYOFWEEK;
                 $scope.weeks.changestatus=editSchedule.DAYOFWEEK;
               }else {
                 $scope.isWeekOk=false;
                 $scope.isMonthOk=false;
               }
               $scope.schedule.name = editSchedule.SCHEDULE_NAME;
               $scope.schedule.command = editSchedule.COMMAND;
             }


            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.save = function () {
              if($scope.grids.changestatus=="每周"){
                $scope.months.changestatus=null;
              }else if($scope.grids.changestatus=="每月"){
                $scope.weeks.changestatus=null
              }else if($scope.grids.changestatus=="每天"){
                $scope.months.changestatus = null;
                $scope.weeks.changestatus = null;
              }
              $scope.schedule.choice=$scope.grids.changestatus;
              $scope.schedule.date=parseInt($scope.months.changestatus);
              $scope.schedule.hour= parseInt($scope.hours.changestatus);
              $scope.schedule.minute =parseInt($scope.minutes.changestatus);
              $scope.schedule.dayOfWeek = $scope.weeks.changestatus;
              $scope.isPause==false?$scope.schedule.state ="RUNNING":$scope.schedule.state ="SUSPEND";
              console.log("on save >>>>$scope.isPause,$scope.schedule",$scope.isPause,$scope.schedule);
              $uibModalInstance.close($scope.schedule);
            }
          }]
      })
      .result;
    };
  }])
  .service('createExpertModule',['$uibModal', function ($uibModal) {
    this.open = function (name) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/dataExplore/expertModule.html',
        size: 'lg',
        controller: ['$cookies', '$scope', '$filter', '$uibModalInstance', '$http','$location','$sce',
          function ($cookies, $scope, $filter, $uibModalInstance, $http,$location,$sce) {

            $scope.notebookPath = '';
            let ipyPath = '';
            $scope.init = function () {

              $http.get('/api/expert/pathNoteBook', {
                params: {
                  "modelName": name
                }
              }).then(function (response) {
                console.log('55555',response);
                ipyPath = response.data.jpyPath;
                $scope.notebookPath = $sce.trustAsResourceUrl(ipyPath);
                // $http.get('/api/jupyter/save').success(function (data) {
                let date = new Date();
                let savaData = {
                  MODEL_NAME: $location.path().split(/[\s/]+/).pop(),
                  USER_ID: $cookies.get("username"),
                  TYPE_MENU_ID: '01',
                  VIEW_MENU_ID: '06',
                  UPDATED_TIME: date.getTime(),
                  NOTEBOOK_PATH: response.data.notebookPath,
                  COMMENT: 'Lets try it!'
                };
                console.log('Data to DB savaData:', savaData);
                $http.post('/api/model/new', savaData).success(function (data) {
                  console.log("Expert MODE save:", data.msg);
                });
                // $location.path("/explore");
                // });
              });
            };
            $scope.init();

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            }
          }]
      }).result;
    };
  }])
  .service('appOperResult',['$uibModal', function ($uibModal) {
    this.open = function () {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/appOperResult.html',
        size: 'size',
        controller: ['$cookies', '$scope', '$filter', '$uibModalInstance',
          function ($cookies, $scope, $filter, $uibModalInstance) {
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            }
          }]
      }).result;
    };
  }])
