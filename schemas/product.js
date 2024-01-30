const dataProducts = require("../data/products.json");
const { getDatabase, client } = require("../config/mongoConnection");
const { ObjectId } = require("mongodb");
const {
  findAllProducts,
  findOneProductById,
  createOneProduct,
  updateOneProduct,
  deleteOneProduct,
  addImageProduct,
} = require("../models/product");
const { GraphQLError } = require("graphql");

const Redis = require("ioredis");
// const redis = new Redis(); // ini akan connect ke localhost:6379

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

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
    createdAt: String
    updatedAt: String
  }

  type Order {
    _id: ID
    userId: ID
    productId: ID
    quantity: Int
    totalPrice: Int
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
    createOrder(productId: ID!, quantity: Int!): Order
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
      // console.log(contextValue.authentication(), "<<< authentication");
      const userLogin = await contextValue.authentication();

      const productCache = await redis.get("products");

      console.log(productCache, "<<< product cache");
      // console.log(userLogin, "<<< userlogin");

      if (productCache) {
        return JSON.parse(productCache);
      }

      const products = await findAllProducts();

      redis.set("products", JSON.stringify(products)); // value yang disimpan harus berupa string
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

      /**
        cara 1: findAllproducts => set ulang cachenya 
        cara 2: delete langsung cachenya, sehingga nanti saat ada orang yg hit getAllproducts, maka langsung ke db
        
       */
      redis.del("products"); //invalidate cache

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
    createOrder: async (_, args, contextValue) => {
      const userLogin = await contextValue.authentication();
      const session = client.startSession();

      try {
        session.startTransaction();

        const { productId, quantity } = args;
        const { userId } = userLogin;
        const database = getDatabase();
        const orderCollection = database.collection("orders");
        const productCollection = database.collection("products");

        const product = await productCollection.findOne(
          {
            _id: new ObjectId(productId),
          },
          { session }
        );

        if (!product) {
          throw new GraphQLError("Product Not Found");
        }

        if (product.stock < quantity) {
          throw new GraphQLError("Out of stock");
        }

        const payloadOrder = {
          productId,
          quantity,
          userId,
          totalPrice: product.price * quantity,
        };

        const newOrder = await orderCollection.insertOne(payloadOrder, {
          session,
        });

        await productCollection.updateOne(
          {
            _id: product._id,
          },
          {
            $set: {
              stock: product.stock - quantity,
            },
          },
          { session }
        );

        await session.commitTransaction();

        const order = await orderCollection.findOne({
          _id: newOrder.insertedId,
        });

        return order;
      } catch (error) {
        await session.abortTransaction();
        // console.log(error.message);
        throw new GraphQLError(error.message || "An error while create order");
      } finally {
        await session.endSession();
      }
    },
  },
};

module.exports = {
  productTypeDefs: typeDefs,
  productResolvers: resolvers,
};
