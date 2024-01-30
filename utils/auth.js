const { GraphQLError } = require("graphql");
const { findUserById } = require("../models/user");
const { verifyToken } = require("./jwt");

const authentication = async (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const token = authorization.split(" ")[1];

  const decodeToken = verifyToken(token);

  // console.log(decodeToken, "<<< decode token");

  const user = await findUserById(decodeToken.id);

  if (!user) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  return {
    userId: user._id,
    userEmail: user.email,
  };
};

module.exports = authentication;
