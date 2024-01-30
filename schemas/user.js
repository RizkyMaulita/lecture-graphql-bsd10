const { createUser, findAllUser } = require("../models/user");

const typeDefs = `#graphql
  type User {
    _id: ID
    username: String!
    email: String!
    password: String
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  type Query {
    getAllUsers: [User]
  }

  type Mutation {
    register(payload: RegisterInput): User
  }
`;

const resolvers = {
  Query: {
    getAllUsers: async (_, args) => {
      const users = await findAllUser();

      return users;
    },
  },
  Mutation: {
    register: async (_, args) => {
      const { payload } = args;

      const user = await createUser(payload);

      return user;
    },
  },
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
