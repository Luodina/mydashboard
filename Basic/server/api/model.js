//
'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();
let moment = require('moment');

router.get('/getProjectList', function(req, res){
    
    Model.findAll({
      raw: true
    }).then(function(model){  
        res.send({model});
    }).catch(err =>{
        console.log("err",err);
    });
    
});

router.post('/new', function(req, res){
    let modelName = req.body.MODEL_NAME;
    let modelInfo = req.body.MODEL_INFO;
    let userName = req.body.USER_ID;
    let menuID = req.body.VIEW_MENU_ID;
    let time = moment(req.body.UPDATED_TIME).format("YYYY-MM-DD");;
    let filePath = req.body.FILE_PATH;
    let notebookPath = req.body.NOTEBOOK_PATH;
    let comment = req.body.COMMENT;
    console.log("req.body", req.body);
    sequelize.transaction(function (t) {
        return Model.create({
            MODEL_ID: t.id, 
            MODEL_NAME: modelName,
            MODEL_INFO: modelInfo, 
            USER_ID: userName, 
            VIEW_MENU_ID: menuID,
            UPDATED_TIME: time,
            FILE_PATH: filePath,
            NOTEBOOK_PATH: notebookPath,
            COMMENT:comment,
            isNewRecord:true})
            .then(function(){res.send({msg:"Success!!!!"});})
            .catch(err =>{console.log("err",err);});
    }) 
});

router.get('/:modelName', function(req, res){
  let modelName = req.params.modelName;
  console.log("req.params.modelName",req.params.modelName, "modelName",modelName); 
  if (modelName !== null){
    Model.findOne({
        where: { MODEL_NAME: modelName},
        raw: true
    })
    .then(function(model){  
      console.log("model is:",model); 
      res.send({model: model});
    })
    .catch(err =>{
      console.log("err",err);
    });
  }
});
module.exports = router; 