require(['jquery', '@jupyterlab/services'], function ($, services) {
  'use strict';

  // The base url of the Jupyter server.
  var BASE_URL = 'http://localhost:8888';
  var token = 'ad475024c8c1ba03573a0359ce27cbaa395cc78d6dbc224b';
  var templatIpynbPath = '/dataProfile.ipynb';

  var options = {
    baseUrl: BASE_URL,
    token:token
  };

  //获取ipynb文件中的source代码
  var sourceCodes=new Array();
  var contents = new services.ContentsManager(options);
  var notebookModel;
  var notebookFilePath;
  var kernel;

  contents.copy(templatIpynbPath, '/dataProfileFolder').then((model) => {
       notebookFilePath = model.path;
       contents.get(notebookFilePath).then(
            (model1) => {
              //console.log(model1);
              notebookModel = model1;
              var cellsLength = model1.content.cells.length;
              for(var i=0;i<cellsLength;i++){
                sourceCodes[i] =  model1.content.cells[i].source;
              }

              //连接到session(如果已经存在该ipynb对应的session,则直接使用;如果没有，则创建一个session
              options = {
                baseUrl: BASE_URL,
                token:token,
                kernelName: 'python',
                path:notebookFilePath
              };

              services.Session.listRunning(options).then(sessionModels => {
                var sessionNums = sessionModels.length;
                var existSession = false;
                for(var i=0;i<sessionNums;i++){
                  var path=sessionModels[i].notebook.path;
                  if(path==notebookFilePath){//存在session，直接连接
                    var sessionOptions = {
                       baseUrl: BASE_URL,
                       token:token,
                       kernelName: sessionModels[i].kernel.name,
                       path: sessionModels[i].notebook.path
                     };
                     services.Session.connectTo(sessionModels[i].id, sessionOptions).then((session) => {
                       console.log('connected to existing session');
                       console.log(session.kernel.name);
                       kernel=session.kernel;
                     });
                     existSession = true;
                     break;
                  }
                }
                if(!existSession){//没有现有的session，新创建session
                  services.Session.startNew(options).then(session => {
                    console.log('started a new session');
                    kernel=session.kernel;
                  });
                }
              });
            }
       );
  });

  $('#dataPreview').click(function () {
    alert(notebookFilePath);
    var filePath = $('#dataFilePath').val();

    //TODO maxm ??
    filePath=filePath.replace(/\\/g,"\\\\\\\\");

    var htmlFilePath = "D:/ideaProjects/OCAI/Basic/app/modules/dataProfile/dataProfile.html"

    var code = sourceCodes[0];
    code = code.replace('filePath=','filePath=\"'+filePath+'\"');
    code = code.replace('htmlFilePath=','htmlFilePath=\"'+htmlFilePath+'\"');

    //console.log(notebookModel);
    notebookModel.content.cells[0].source=code;
    contents.save(notebookFilePath,notebookModel);

    //alert('after save source');



    var future = kernel.requestExecute({ code: code });

    future.onIOPub = function (msg) {
      if(msg.header.msg_type=='execute_result'){
        var previewDatas = msg.content.data["text/html"];

        notebookModel.content.cells[0].metadata.collapsed=false;
        notebookModel.content.cells[0].outputs=[{"output_type": "execute_result","data":msg.content.data,"metadata":{},"execution_count": 1}];
        contents.save(notebookFilePath,notebookModel);


        //添加标题
        var firstLineData = previewDatas[0];
        var htmlStr = "<tr>";

        for(var k in firstLineData) {
          htmlStr = htmlStr + "<th>"+k+"</th>"
        }

        htmlStr = htmlStr + "</tr>";

        //添加数据
        for(var i=0;i<previewDatas.length;i++){
          var item = previewDatas[i];
          htmlStr = htmlStr + "<tr>"
          for(var k in item) {
              htmlStr = htmlStr + "<td>"+item[k]+"</td>"
          }
          htmlStr = htmlStr +"</tr>";
        }

        //添加到table中
        var $table = $("#previewDatas");
        $table.append(htmlStr);
      }
    };

    future.onReply = function (reply) {
    };

    future.onDone = function () {
    };
  });

  $('#displayReport').click(function () {
      $("#firstPage").css({display:"none"})
      $("#reportDiv").css({display:"block"})
      $("#refreshIframeB").click()
      $("#refreshIframeB").css({display:"none"})
   });

  //查看预处理建议
  $('#getProcessSuggestions').click(function () {
        //TODO maxm var code = 'execfile("'+pyFilePath+'getProcessSuggestions.py")';
        var code = sourceCodes[1];

        var future = kernel.requestExecute({ code: code });

        future.onIOPub = function (msg) {
            console.log('Got IOPub:', msg);
            console.log(msg.header.msg_type);
            console.log(JSON.stringify(msg.content));

            if(msg.header.msg_type=='stream'){
              var suggestions = JSON.parse(JSON.parse(JSON.stringify(msg.content)).text);

              notebookModel.content.cells[1].metadata.collapsed=false;
              notebookModel.content.cells[1].outputs=[{"name": "stdout","output_type": "stream","text":suggestions}];
              contents.save(notebookFilePath,notebookModel);

              //相关性
              var varCorrSuggestions = suggestions.highCorr;
              var varCorrHtmlStr = "";

              for(var i=0;i<varCorrSuggestions.length;i++){
                var item = varCorrSuggestions[i];
                varCorrHtmlStr = varCorrHtmlStr + "<tr>"
                varCorrHtmlStr = varCorrHtmlStr + "<td>相关性"+item["corrValu"]+"</td>";
                varCorrHtmlStr = varCorrHtmlStr + "<td><input name='corrValues' type='checkbox' value='"+item["varName"]+"' />"+item["varName"]+"</td>";
                varCorrHtmlStr = varCorrHtmlStr + "<td><input name='corrValues' type='checkbox' value='"+item["corrVarName"]+"' />"+item["corrVarName"]+"</td>";
                varCorrHtmlStr = varCorrHtmlStr +"</tr>";
              }

              var varCorrTable = $("#varCorrTable");
              varCorrTable.append(varCorrHtmlStr);

              //空值处理
              var imputerSuggestions = suggestions.imputer;

              var imputerHtmlStr = "";

              for(var i=0;i<imputerSuggestions.length;i++){
                var item = imputerSuggestions[i];
                imputerHtmlStr = imputerHtmlStr + "<tr>"

                imputerHtmlStr = imputerHtmlStr + "<td>变量名:"+item["varName"]+"</td>";
                imputerHtmlStr = imputerHtmlStr + "<td>空值比例:"+item["imputerRatio"]+"</td>";
                imputerHtmlStr = imputerHtmlStr + "<td><select name='imputerOpers' id='"+item["varName"]+"'><option value='none'>不处理</option><option value='mean' >mean</option><option value='median' >median</option><option value='most_frequent' >most_frequent</option></select></td>";
                imputerHtmlStr = imputerHtmlStr +"</tr>";
              }

              var imputerTable = $("#imputerTable");
              imputerTable.append(imputerHtmlStr);

              //标准化处理
              var scalarSuggestions = suggestions.scalar;

              var scalarHtmlStr = "";

              for(var i=0;i<scalarSuggestions.length;i++){
                var item = scalarSuggestions[i];
                scalarHtmlStr = scalarHtmlStr + "<tr>"
                scalarHtmlStr = scalarHtmlStr + "<td>变量名:"+item["varName"]+"</td>";
                scalarHtmlStr = scalarHtmlStr + "<td>标准差:"+item["stdValue"]+"</td>";
                scalarHtmlStr = scalarHtmlStr + "<td><img src='"+item["miniHistogram"]+"'></td>";
                scalarHtmlStr = scalarHtmlStr + "<td><select name='scalarOpers' id='"+item["varName"]+"'><option value='none'>不处理</option><option value='Standarded' >Standarded</option><option value='MaxAbs' >MaxAbs</option><option value='Robust' >Robust</option><option value='MinMax' >MinMax</option></select></td>";
                scalarHtmlStr = scalarHtmlStr +"</tr>";
              }

              var scalarTable = $("#scalarTable");
              scalarTable.append(scalarHtmlStr);
            }
        };

        future.onReply = function (reply) {
        };

        future.onDone = function () {
          $("#reportDiv").css({display:"none"})
          $("#processSuggestions").css({display:"block"})
        };
  });

  $('#apply').click(function () {
      //deleteCols 要删除的列，如果是多个列，以逗号分割
      var deleteCols = "";
      var unCheckedBoxs = $("input[name='corrValues']").not("input:checked");
      for(var i=0;i<unCheckedBoxs.length;i++){
        if(i!=0){
          deleteCols = deleteCols + ",";
        }
        deleteCols = deleteCols + unCheckedBoxs[i].value;
      }

      //imputerCols需要做空值处理的列，json格式，例如：{'petal width (cm)':'median','petal length (cm)':'mean','sepal width (cm)':'most_frequent','sepal length (cm)':'most_frequent'}
      var imputerCols = "{";
      var imputerSelectItems = $("select[name='imputerOpers']");
      for(var i=0;i<imputerSelectItems.length;i++){
          var varName = imputerSelectItems[i].id;
          var option = imputerSelectItems[i].value;
          if(option!='none'){
            if(imputerCols!='{'){
              imputerCols = imputerCols + ",";
            }
            imputerCols = imputerCols + "'" +varName+ "'" + ":" + "'" +option+ "'";
          }
      }
      imputerCols = imputerCols + "}";

      //standardCols需要做正则化处理的列，json格式，例如：{'petal width (cm)':'Standarded','petal length (cm)':'MinMax','sepal width (cm)':'MaxAbs','sepal length (cm)':'Robust'}
      var standardCols = "{";
      var standardSelectItems = $("select[name='scalarOpers']");
      for(var i=0;i<standardSelectItems.length;i++){
          var varName = standardSelectItems[i].id;
          var option = standardSelectItems[i].value;
          if(option!='none'){
            if(standardCols!='{'){
              standardCols = standardCols + ",";
            }
            standardCols = standardCols + "'" +varName+ "'" + ":" + "'" +option+ "'";
          }
      }
      standardCols = standardCols + "}";

      var code = sourceCodes[2];
      code = code.replace("deleteCols=",deleteCols);
      code = code.replace("imputerCols=",imputerCols);
      code = code.replace("standardCols=",standardCols);
      notebookModel.content.cells[2].source=code;
      contents.save(notebookFilePath,notebookModel);

      var future = kernel.requestExecute({ code: code });

      future.onIOPub = function (msg) {

        /*console.log('Got IOPub:', msg);
        console.log(msg.header.msg_type)
        console.log(JSON.stringify(msg.content))*/
      };

      future.onReply = function (reply) {
      };

      future.onDone = function () {
      };
  });

  $('#previewProcessedData').click(function () {
        var code = sourceCodes[3];
        var future = kernel.requestExecute({ code: code });

        future.onIOPub = function (msg) {
          if(msg.header.msg_type=='execute_result'){
              var previewDatas = msg.content.data["text/html"];
              notebookModel.content.cells[3].metadata.collapsed=false;
              notebookModel.content.cells[3].outputs=[{"output_type": "execute_result","data":msg.content.data,"metadata":{},"execution_count": 1}];
              contents.save(notebookFilePath,notebookModel);
          }
        };

        future.onReply = function (reply) {
        };

        future.onDone = function () {
          contents.save(notebookFilePath,notebookModel);

          //save a record to table 'MODEL_INFO'
          //MODEL_ID  32 UUID
          //USER_ID
          //VIEW_OR_CODE VIEW
          //VIEW_MENU_ID 01_01_01
          //MODEL_NAME
          //NOTEBOOK_PATH notebookFilePath
          //USER_INPUT_ITEMS json csvFilePath  deleteCols  imputerCols  standardCols
          //UPDATE_TIME  now
          //COMMENT

          alert("保存成功");
        };
    })

  $('#saveData').click(function () {
      var outputFilePath = "E:/newDataFile.csv";
      var code = sourceCodes[4];
      code = code.replace("outputFilePath=",outputFilePath);
      notebookModel.content.cells[4].source=code;
      contents.save(notebookFilePath,notebookModel);
      var future = kernel.requestExecute({ code: code });

      future.onIOPub = function (msg) {
        /*console.log('Got IOPub:', msg);
        console.log(msg.header.msg_type)
        console.log(JSON.stringify(msg.content))*/
      };

      future.onReply = function (reply) {
      };

      future.onDone = function () {
        contents.save(notebookFilePath,notebookModel);

        //save a record to table 'MODEL_INFO'
        //MODEL_ID  32 UUID
        //USER_ID
        //VIEW_OR_CODE VIEW
        //VIEW_MENU_ID 01_01_01
        //MODEL_NAME
        //NOTEBOOK_PATH notebookFilePath
        //USER_INPUT_ITEMS json csvFilePath  deleteCols  imputerCols  standardCols
        //UPDATE_TIME  now
        //COMMENT

        alert("保存成功");
      };
  });
});
