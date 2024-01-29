require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = "db_bsd_10";
let db;

async function mongoConnect() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log("Connected successfully to mongodb");

    db = client.db(dbName);
    // console.log(db, "<<< db di mongo connect");
    return db;
  } catch (error) {
    await client.close();
  }
}

function getDatabase() {
  return db;
}

module.exports = {
  mongoConnect,
  db,
  getDatabase,
};
