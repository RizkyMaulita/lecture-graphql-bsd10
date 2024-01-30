const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { bookTypeDefs, bookResolvers } = require("./schemas/book");
const { productTypeDefs, productResolvers } = require("./schemas/product");
const { mongoConnect } = require("./config/mongoConnection");
const { userTypeDefs, userResolvers } = require("./schemas/user");

const server = new ApolloServer({
  typeDefs: [bookTypeDefs, productTypeDefs, userTypeDefs],
  resolvers: [productResolvers, bookResolvers, userResolvers],
  introspection: true, // untuk ketika deploy, apollo playground tetap bisa diakses
});

(async () => {
  const db = await mongoConnect();
  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => {
      // console.log("context dipanggil");
      // tidak direkomendasikan bikin sebuah auth / function async di luar return
      return {
        db,
        // userId: 1,
        authentication: () => {
          return {
            userId: 1,
          };
        },
      };
    },
    listen: {
      port: 4000,
    },
  });
  console.log(`🚀  Server ready at: ${url}`);
})();
