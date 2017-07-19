
'use strict';
angular.module('basic')
  .controller('ChoreographyCtrl',['makefileList','$http','$location','$scope','createArrange',
  (makefileList, $http, $location, $scope, createArrange) => {
    let modelNameList =[];
    let targetList =[];
    $scope.makeFileList =[];
    $scope.appName = $location.path().split(/[\s/]+/).pop();
    $http.get('/api/model/modelList/' + $scope.appName)
    .success(modelList => {
      if (modelList !== null && modelList !== undefined ){
        modelList.modelList.map(item => { 
          modelNameList.push(item.MODEL_NAME);
        });  
      }
    })
    .catch(err =>{console.log('err',err);});
    $scope.init = () => {
      makefileList.get({ appName: $scope.appName }, function (appMakeFileList) {
        if (appMakeFileList !== null && appMakeFileList !== undefined ){
          appMakeFileList.appMakeFileList.map(item => {   
            if (item.PREREQUISITES !== null && item.PREREQUISITES !== undefined ){
              let tmp = item.PREREQUISITES;
              item.PREREQUISITES = tmp.split(' ');
            }
            targetList.push(item.TARGET);
            $scope.makeFileList.push({ MAKEFILE_ID: item.MAKEFILE_ID,
                                           TARGET : item.TARGET,
                                     PREREQUISITES: item.PREREQUISITES});
          });  
        }
        console.log('$scope.makeFileList', $scope.makeFileList);
      });
    };
    $scope.init();
    function newMakeFileName(){
        let num = 0;
        if ($scope.makeFileList.length !== 0) {
          let tmp = $scope.makeFileList[$scope.makeFileList.length-1];
          tmp ? num = parseInt(tmp.MAKEFILE_ID):''; 
        }      
        return num + 1;
    }   

    function targetNameList(modelNameList, targetList){
      return modelNameList.filter( function( el ) {
        return !targetList.includes( el );
      } );
    }
    
    $scope.openAddArrange = () => {
      createArrange.open(targetNameList(modelNameList, targetList), modelNameList, $scope.appName, newMakeFileName()).then((msg) => {
        if (msg === 'success') { 
          $scope.makeFileList = [];
          $scope.init();
        }
      })
      .catch(err =>{console.log('err',err);});
    };  

    $scope.makeFile = () => {        
        let content = '';
        $scope.makeFileList.forEach((appMakeFile)=> {
          content = content + appMakeFile.TARGET + ':';
          appMakeFile.PREREQUISITES?content = content + appMakeFile.PREREQUISITES.join(' '):content;
          content = content + '\r\n';
          content = content +'\tjupyter notebook --execute ' + appMakeFile.TARGET  + ' --output-dir=reports\r\n';
        }); 
        console.log('content', content); 
    };
  }])
  .directive('choreography', () => {
    return {
      templateUrl: 'views/dataApp/appModel/runTheChoreography.html'
    };
  });

