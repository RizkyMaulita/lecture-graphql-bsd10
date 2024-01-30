const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");

const getCollection = () => {
  const db = getDatabase();
  const productCollection = db.collection("products");
  return productCollection;
};

const findAllProducts = async () => {
  // const products = await getCollection().find({}).toArray();
  const agg = [
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
    {
      $sort: {
        stock: 1,
      },
    },
    {
      $limit: 3,
    },
  ];

  const products = await getCollection().aggregate(agg).toArray();

  return products;
};

const findOneProductById = async (id) => {
  // const product = await getCollection().findOne({
  //   _id: new ObjectId(id),
  // });

  const agg = [
    {
      $match: {
        _id: new ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
  ];

  const product = await getCollection().aggregate(agg).toArray();
  console.log(product[0], "<<< product");

  return product[0];
};

const createOneProduct = async (payload) => {
  const productCollection = getCollection();
  payload.imageUrls = [];
  const newProduct = await productCollection.insertOne(payload);

  // console.log(newProduct, "<<< new product");

  const product = await productCollection.findOne({
    _id: newProduct.insertedId,
  });

  return product;
};

const updateOneProduct = async (id, payload) => {
  const productCollection = getCollection();

  await productCollection.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: payload,
    }
  );

  const product = await productCollection.findOne({
    _id: new ObjectId(id),
  });

  return product;
};

const deleteOneProduct = async (id) => {
  const deleteProduct = await getCollection().deleteOne({
    _id: new ObjectId(id),
  });

  return deleteProduct;
};

const addImageProduct = async (id, imgUrl) => {
  const productCollection = getCollection();

  const updateProduct = await productCollection.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      // $push: {
      //   imageUrls: {
      //     name: imgUrl,
      //   },
      // },
      $addToSet: {
        // untuk push yang unique
        imageUrls: {
          name: imgUrl,
        },
      },
    }
  );

  const product = await productCollection.findOne({
    _id: new ObjectId(id),
  });

  return product;
};

module.exports = {
  findAllProducts,
  findOneProductById,
  createOneProduct,
  updateOneProduct,
  deleteOneProduct,
  addImageProduct,
};
