//
'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();

router.get('/getProjectList', function(req, res){
    
    Model.findAll({
      raw: true
    }).then(function(model){  
        res.send({model});
    }).catch(err =>{
        console.log("err",err);
    });
    
});

router.post('/newModel', function(req, res){
    // (1, 'User1', "01","02_01",'Newmodel', '/dataProfileFolder/dataProfile.ipynb', "/Users/luodina/Documents/test/testDB.csv", "Add a description", NULL,"0", NULL, CURDATE() , 'blahblah' )
    let modelName = req.body.modelName;
    sequelize.transaction(function (t) {
    console.log("!!!!!!!!!!!!!!!!!!!!t",t);
        return Model.create({MODEL_ID: t.id, MODEL_NAME: modelName,
        isNewRecord:true}).then(function(){  
            res.send({msg:"Success!!!!"});
        }).catch(err =>{
            console.log("err",err);
        });
    }) 
});

module.exports = router; 