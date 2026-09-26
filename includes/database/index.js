const path = require("path");
const Sequelize = require("sequelize");

const storage = path.resolve(__dirname, "../../data.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [/SQLITE_BUSY/i, /SQLITE_LOCKED/i],
    name: "query",
    max: 5
  },
  dialectOptions: {
    timeout: 10000
  },
  define: {
    freezeTableName: true,
    timestamps: true
  }
});

module.exports = { sequelize, Sequelize };
