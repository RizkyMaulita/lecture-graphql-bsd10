const dataProducts = require("../data/products.json");
const { getDatabase } = require("../config/mongoConnection");
const { ObjectId } = require("mongodb");
const {
  findAllProducts,
  findOneProductById,
  createOneProduct,
  updateOneProduct,
  deleteOneProduct,
  addImageProduct,
} = require("../models/product");
// define schema / typedefs => untuk contract
const typeDefs = `#graphql
  #ini comment
  type Product {
    _id: ID!
    name: String!
    price: Int
    stock: Int
    authorId: ID
    imageUrls: [Image]
    author: User
  }

  type Image {
    name: String
  }

  # kalian bebas define nama type apapun kecuali "Query" dan "Mutation"
  #type Query => kalian define sebuah routes dengan method GET
  type Query {
    getAllProducts: [Product]
    getProductById(id: ID!): Product
  }

  input ProductUpdateInput {
    name: String
    price: Int
    stock: Int
    imageUrls: [String]
  }

  type Mutation {
    createProduct(name: String!, price: Int!, stock: Int!): Product
    updateProductById(id: ID!, productPayload: ProductUpdateInput): Product
    deleteProductById(id: ID!): String
    addImageProduct(imgUrl: String!, id: ID!): Product
  }
`;

// resolvers => kalian define controllers kalian
const resolvers = {
  Query: {
    getAllProducts: async (_parent, _args, contextValue) => {
      // find all ke database
      // console.log(db, "<<< db di resolvers");
      // console.log(contextValue.db, "<<< context db");
      // console.log(getDatabase(), "<<< get database");
      const products = await findAllProducts();
      return products;
    },
    getProductById: async (_, args, contextValue) => {
      // console.log(
      //   contextValue.authentication(),
      //   "<<< context value authentication"
      // );
      // const product = dataProducts.find((val) => val.id === Number(args.id));
      const product = findOneProductById(args.id);

      return product;
    },
  },
  Mutation: {
    createProduct: async (_parent, args) => {
      // const db = getDatabase();
      // const productCollection = db.collection("products");

      // const newProduct = await productCollection.insertOne({
      //   name: args.name,
      //   stock: args.stock,
      //   price: args.price,
      // });

      // console.log(newProduct, "<<< new product");

      // const product = await productCollection.findOne({
      //   _id: newProduct.insertedId,
      // });

      const product = await createOneProduct({
        name: args.name,
        stock: args.stock,
        price: args.price,
      });

      return product;
    },
    updateProductById: async (_parent, args) => {
      const db = getDatabase();
      const productCollection = db.collection("products");

      const payload = {};

      if (args.productPayload.name != null) {
        payload.name = args.productPayload.name;
      }

      if (args.productPayload.stock != null) {
        payload.stock = args.productPayload.stock;
      }

      if (args.productPayload.price != null) {
        payload.price = args.productPayload.price;
      }

      // await productCollection.updateOne(
      //   {
      //     _id: new ObjectId(args.id),
      //   },
      //   {
      //     // $set: {
      //     //   ...args.productPayload,
      //     //   // name: args.productPayload.name,
      //     //   // stock: args.productPayload.stock,
      //     //   // price: args.productPayload.price,
      //     // },
      //     $set: payload,
      //   }
      // );

      // const product = await productCollection.findOne({
      //   _id: new ObjectId(args.id),
      // });

      const product = await updateOneProduct(args.id, payload);

      return product;
    },
    deleteProductById: async (_parent, args) => {
      // const db = getDatabase();
      // const productCollection = db.collection("products");

      // await productCollection.deleteOne({
      //   _id: new ObjectId(args.id),
      // });

      await deleteOneProduct(args.id);

      return `Successfully deleted product with id ${args.id}`;
    },
    addImageProduct: async (_parent, args) => {
      const product = await addImageProduct(args.id, args.imgUrl);

      return product;
    },
  },
};

module.exports = {
  productTypeDefs: typeDefs,
  productResolvers: resolvers,
};
