require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = "db_bsd_10";

async function connectMongo() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const productCollection = db.collection("products");

    const products = await productCollection
      .find(
        {},
        {
          projection: {
            credentialValue: 0, // jadi nanti ini di exclude
          },
        }
      )
      .toArray();
    console.log(products, "<<< products");
    // const product = await productCollection.findOne();
    // console.log(product);

    // const newProduct = await productCollection.insertOne({
    //   name: "Product 5",
    //   stock: 30,
    // });

    // const product = await productCollection.findOne({
    //   _id: newProduct.insertedId,
    // });
    // console.log(product);

    // const id = "65b74ebc83b97868d646e319";
    // const product = await productCollection.findOne({
    //   _id: new ObjectId(id),
    // });
    // console.log(product);

    return "done.";
  } catch (error) {
    await client.close();
  }
}

connectMongo().then((res) => {
  console.log(res);
});
