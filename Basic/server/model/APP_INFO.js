"use strict";
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('APP_INFO', {
    APP_ID: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      primaryKey: true
    },
    USER_NAME: {
      type: DataTypes.CHAR(32),
      allowNull: false
    },
    APP_NAME: {
      type: DataTypes.DATE(),
      allowNull: false
    },
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'APP_INFO'
  });
};