'use strict';
module.exports = {
<<<<<<< HEAD
    dev: {
        webIp: 'http://192.168.1.105:9000',
        dist: 'app',
        port: 9000,
        notebookUrl: 'http://10.20.51.5:8000/',
        mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
        logTo: 'stdout', // 'stdout' or 'file'. if 'file', logs will be saved in 'logs/server.log'
        logLevel: 'debug', // 'debug' or 'info'
        jupyterHubHost: '10.20.51.5',
        jupyterHubUserName: 'root',
        jupyterHubPassword: 'Asiainfo123456'
        // huburl:'http://10.20.51.5:8000/user/'
    },
    prod: {
        webIp: 'http://192.168.1.105:9000',
        dist: 'app',
        port: 9000,
        notebookUrl: 'http://127.0.0.1:8888/',
        token: '99917c916760d95049898ac791ad3f7d05d717b183dd6f14',
        mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
        appPath: 'notebookApp',
        modelPath: 'notebookModel',
        logTo: 'stdout', // 'stdout' or 'file'
        logLevel: 'debug' // 'debug' or 'info'
    },
    env: 'dev',
    trans: 'zh'
=======
  dev: {
    webIp: 'http://192.168.0.101:9000',
    dist: 'app',
    port: 9000,
    notebookUrl: 'http://10.20.51.5:8000/',
    mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
    logTo: 'stdout', // 'stdout' or 'file'. if 'file', logs will be saved in 'logs/server.log'
    logLevel: 'debug', // 'debug' or 'info'
    jupyterHubHost: '10.20.51.5',
    jupyterHubUserName: 'root',
    jupyterHubPassword: 'Asiainfo123456'
    // huburl:'http://10.20.51.5:8000/user/'
  },
  prod: {
    webIp: 'http://192.168.0.101:9000',
    dist: 'app',
    port: 9000,
    notebookUrl: 'http://127.0.0.1:8888/',
    token: '99917c916760d95049898ac791ad3f7d05d717b183dd6f14',
    mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
    appPath: 'notebookApp',
    modelPath: 'notebookModel',
    logTo: 'stdout', // 'stdout' or 'file'
    logLevel: 'debug' // 'debug' or 'info'
  },
  env: 'dev',
  trans: 'zh'
>>>>>>> 861d17c0da87ccb1d57682ea9d4b6046e56d1449
};
