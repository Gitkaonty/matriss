require("dotenv").config;

const SERVERNAME = process.env.SERVER;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASENAME = process.env.DATABASENAME;
const PORT = process.env.PORT;

const { Pool } = require('pg');
const isProduction = process.env.NODE_ENV === 'production';
//const connectionString = `postgresql://${USER}:${process.env.PASSWORD}@${process.env.SERVER}:${process.env.PORT}/${process.env.DATABASENAME}`
const connectionString = "postgresql://postgres:admin@localhost:5432/kaonty"


const pool = new Pool({
    connectionString: connectionString,
});


module.exports = { pool };