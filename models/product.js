const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");

const getCollection = () => {
  const db = getDatabase();
  const productCollection = db.collection("products");
  return productCollection;
};

const findAllProducts = async () => {
  const products = await getCollection().find({}).toArray();

  return products;
};

const findOneProductById = async (id) => {
  const product = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  return product;
};

module.exports = {
  findAllProducts,
  findOneProductById,
};
