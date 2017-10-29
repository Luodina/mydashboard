'use strict';
module.exports = {
  dev: {
    webIp: 'http://192.168.0.101:9000',
    dist: 'app',
    port: 9000,
    serverType: 'notebook',
    notebookUrl: 'http://localhost:8888/',
    token: '88ee53e8e6b2f565d0425c17f781d3080400b36b035340b1',
    dataDir: '../data_dir/',
    mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
    logTo: 'stdout', // 'stdout' or 'file'. if 'file', logs will be saved in 'logs/server.log'
    logLevel: 'debug', // 'debug' or 'info'
  },
  prod: {
    // webIp: 'http://192.168.0.101:9001',
    dist: 'dist',
    port: 9000,
    serverType: 'notebook',
    notebookUrl: 'http://localhost:8888/',
    token: '88ee53e8e6b2f565d0425c17f781d3080400b36b035340b1',
    dataDir: '../data_dir/',
    logTo: 'file', // 'stdout' or 'file's
    logLevel: 'info', // 'debug' or 'info'
    mariadb: 'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai'
  },
  env: 'prod',
  trans: 'zh'
};
