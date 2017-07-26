'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let MakeSchedule = require('../model/APP_MAKESCHEDULE')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();
let moment = require('moment');

let schedule = require('node-schedule');
const exec = require('child_process').exec;
const config = require('./../config');
const env = config.env || 'dev';
const dataAppPath=config[env].appPath;

// format schedule time
function getTime(scheduleObj,callback){
  var time = {hour: scheduleObj.hour, minute: scheduleObj.minute};
  scheduleObj.DATE?time.date=scheduleObj.DATE:time;
  scheduleObj.DAYOFWEEK?time.dayOfWeek=scheduleObj.DAYOFWEEK:time;
  callback(time);
}

// new scheduleJob
function newScheduleJob(scheduleName,time,command,appName){
    schedule.scheduleJob(scheduleName,time,function () {
      //check the db,if the schedule state == RUNNING
      MakeSchedule.findOne({
        where: { SCHEDULE_NAME: scheduleName},
        raw: true
      }).then(makeSchedule => {
        //console.log("schedule -------------------",makeSchedule);
        if(makeSchedule.STATE && makeSchedule.STATE=="RUNNING"){
          //console.log("makeSchedule Running ------------------->",command);
          scheduleExecFile(appName,command,dataAppPath,function (data) {
            //console.log("schedule shell---->",data)

          })

        }
      })
    });
}


// exec schedule shell
function scheduleExecFile(appName,target,dataAppPath,callback) {
  //const { execFile } = require('child_process');
  // const child=execFile('./scheduleShell.sh', [appName,target,appFolderPath], (error, stdout, stderr) => {
  //   if (error) {
  //     throw error;
  //     callback(error)
  //   }
  //   console.log(stdout);
  //   callback(stdout)
  // });
  var appFolderPath=dataAppPath+"/"+appName;
  var comms = "cd "+appFolderPath+" && make "+target;
  //console.log("--------------comms=>",comms)
  exec(comms,[""],(error,stdout,stderr) =>{
    if(error){
      throw error;
    }
    //console.log("shell exec--------->",stdout)
    callback(stdout)
  })
}

// check the schedule db  if
function sentinel() {
  MakeSchedule.findAll({ raw: true })
    .then(makeSchedule => {
      //console.log("schedule list>>",makeSchedule);
      makeSchedule.forEach(function (scheduleObj) {
        //console.log("-------------->>>>",schedule.scheduledJobs[scheduleObj.SCHEDULE_NAME])
        if(scheduleObj.STATE=="RUNNING"&&!schedule.scheduledJobs[scheduleObj.SCHEDULE_NAME]){
          getTime(scheduleObj,function (time) {
            newScheduleJob(scheduleObj.SCHEDULE_NAME,time);
          })
        }
      })
    })
    .catch(err =>{console.log('err',err);});

}
setInterval(sentinel,10000);


// SELECT * from APP_MAKESCHEDULE;
router.get('/getMakeScheduleList', (req, res) => {
    MakeSchedule.findAll({ raw: true })
    .then(makeSchedule => { res.send({ makeSchedule });})
    .catch(err =>{console.log('err',err);});
});

// SELECT * from APP_MAKESCHEDULE where APP_ID = 1;
router.get('/getScheduleListById/:appID',(req, res) => {
  let app_id = req.params.appID;
  //console.log('app_id',app_id);
  if (app_id !== null){
    MakeSchedule.findAll({
        where: { APP_ID: app_id},
        raw: true
    })
    .then(makeSchedule => {
      //console.log('makeSchedule is:',makeSchedule);
      res.send({makeSchedule});
    })
    .catch(err =>{console.log('err',err);});
  }
});

router.get('/getScheduleListByName/:scheduleName',(req, res) => {
  let scheduleName = req.params.scheduleName;
  //console.log('scheduleName',scheduleName);
  if (scheduleName !== null){
    MakeSchedule.count({
      where: { SCHEDULE_NAME: scheduleName},
      raw: true
    })
      .then(makeSchedule => {
        //console.log('schedule count:',makeSchedule);
        res.send({count: makeSchedule});
      })
      .catch(err =>{console.log('err',err);});
  }
});



// create new makeSchedule
router.post('/createSchedule',(req, res) => {
    let appID = req.body.APP_ID;
    let scheduleName = req.body.SCHEDULE_NAME;
    let state = req.body.STATE;
    let command = req.body.COMMAND;
    let time =  eval(req.body.TIME);
    sequelize.transaction(t => {
        return MakeSchedule.create({
            ID: t.id,
            APP_ID: appID,
            SCHEDULE_NAME:scheduleName,
            STATE:state,
            COMMAND:command,
            SECOND: time.second,
            MINUTE: time.minute,
            HOUR: time.hour,
            DATE: time.date,
            MONTH: time.month,
            YEAR: time.year,
            DAYOFWEEK: time.dayOfWeek,
            isNewRecord:true
        }).then(() => {
          newScheduleJob(scheduleName,time,command,appID);
          // schedule.scheduleJob(scheduleName,time,function () {
          //   //check the db,if the schedule state == RUNNING
          //   MakeSchedule.findOne({
          //     where: { SCHEDULE_NAME: scheduleName},
          //     raw: true
          //   }).then(makeSchedule => {
          //     console.log("schedule -------------------",makeSchedule);
          //     if(makeSchedule.STATE && makeSchedule.STATE=="RUNNING"){
          //       console.log("makeSchedule Running -------------------");
          //     }
          //   })
          // });
          //console.log("schedule list===========>",schedule.scheduledJobs);
          res.send({ msg:'Success!!!!'});
        }).catch(err =>{
          console.log('err', err);
          res.send({err:err});
        });
    });
});

//edit schedule by schedule_name
router.post('/updateScheduleByName',(req, res) => {
  let appId=req.body.APP_ID;
  let scheduleName = req.body.SCHEDULE_NAME;
  let state = req.body.STATE;
  let command = req.body.COMMAND;
  let time =  eval(req.body.TIME);
  let param={
    COMMAND:command,
    SECOND:time.second,
    MINUTE:time.minute,
    HOUR:time.hour,
    DATE:time.date,
    MONTH: time.month,
    YEAR: time.year,
    DAYOFWEEK: time.dayOfWeek,
    STATE:state
  }
  sequelize.transaction(t => {
    return MakeSchedule.update(
      param,{
        where:{SCHEDULE_NAME:scheduleName}
      }
    ).then(() => {
      //kill the old schedule
      //console.log("schedule.scheduledJobs===>>>>",schedule.scheduledJobs[schedule.name])
      if(schedule.scheduledJobs&& schedule.scheduledJobs[scheduleName]){
        schedule.scheduledJobs[scheduleName].cancel();
        //console.log("schedule list afte delte=====edit",schedule.scheduledJobs);
      }
      newScheduleJob(scheduleName,time,command,appId);
      //create the new chedule with the same name
      // schedule.scheduleJob(scheduleName,time,function () {
      //   //check the db,if the schedule state == RUNNING
      //   MakeSchedule.findOne({
      //     where: { SCHEDULE_NAME: scheduleName},
      //     raw: true
      //   }).then(makeSchedule => {
      //     console.log("schedule -------------------",makeSchedule);
      //     if(makeSchedule.STATE && makeSchedule.STATE=="RUNNING"){
      //       console.log("makeSchedule Running ------------------->");
      //     }
      //   })
      // });
      //console.log("schedule list===========>",schedule.scheduledJobs);
      res.send({ msg:'Success!!!!'});
    }).catch(err =>{
      console.log('err', err);
      res.send({err:err});
    });
  });
});

//delete schedule by schedule_name
router.post('/deleteScheduleByName',(req,res) =>{
  let scheduleName = req.body.SCHEDULE_NAME;
  //delete schedule in db
  sequelize.transaction(t => {
    return MakeSchedule.destroy({
      where:{SCHEDULE_NAME:scheduleName}
    }).then(() => {
      //kill schedule
      if(schedule.scheduledJobs[scheduleName]){
        schedule.scheduledJobs[scheduleName].cancel();
        //console.log("schedule list afte delte=====",schedule.scheduledJobs);
      }
      res.send({ msg:'success'});
    }).catch(err =>{res.send({err:err})});

  });
});

//pause or continue Schedule by scheduleName
router.post('/updateStateByName',(req,res) =>{
  let state = req.body.STATE;
  let scheduleName = req.body.SCHEDULE_NAME;
  let param = {STATE:state}
  sequelize.transaction(t => {
    return MakeSchedule.update(
      param,{
        where:{SCHEDULE_NAME:scheduleName}
      }
    ).then(() => {res.send({ msg:'updateState Success!!!!' });})
      .catch(err =>{res.send({err:err})});
  });
});

module.exports = router;
