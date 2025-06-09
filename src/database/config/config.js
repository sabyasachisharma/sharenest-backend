require('dotenv').config();

module.exports = {
  LOCAL: {
    username: process.env.MYSQL_DB_USER || 'sharenestadmin',
    password: process.env.MYSQL_DB_PASS || 'sharenest123',
    database: process.env.MYSQL_DB_NAME || 'sharenest',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || '3308',
    dialect: "mysql",
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  TEST: {
    username: process.env.MYSQL_DB_USER || 'sharenestadmin',
    password: process.env.MYSQL_DB_PASS || 'sharenest123',
    database: process.env.MYSQL_DB_NAME || 'sharenest',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || '3306',
    dialect: "mysql",
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  STG: {
    username: process.env.MYSQL_DB_USER || 'sharenestadmin',
    password: process.env.MYSQL_DB_PASS || 'sharenest123',
    database: process.env.MYSQL_DB_NAME || 'sharenest',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || '3306',
    dialect: "mysql",
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  PROD: {
    username: process.env.MYSQL_DB_USER || 'sharenestadmin',
    password: process.env.MYSQL_DB_PASS || 'sharenest123',
    database: process.env.MYSQL_DB_NAME || 'sharenest',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || '3306',
    dialect: "mysql",
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
};