const mysql = require('mysql2/promise');

const { MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE, MYSQL_PORT, MYSQL_PASSWORD } = process.env;

let db = null;

function getDb(){
    return db;
}
async function connectToDatabase() {
  return await mysql
    .createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
    })
    .catch((err) => console.log(err));
}

module.exports = { connectToDatabase, getDb };
