const books = [
  {
    id: 1,
    title: "The Awakening",
    author: "Kate Chopin",
    year: 2020,
    createdAt: "2020",
    updatedAt: "2020",
  },
  {
    id: 2,
    title: "City of Glass",
    author: "Paul Auster",
    year: 2015,
    createdAt: "2019",
    updatedAt: "2019",
  },
];

// define schema / typedefs => untuk contract
const typeDefs = `#graphql
  #ini comment
  type Book {
    id: ID!
    title: String!
    author: String
    year: Int
  }

  type ResponseBookMutation {
    statusCode: Int!
    message: String
    data: Book
  }

  input BookInput {
    title: String!
    author: String
    year: Int
  }

  # kalian bebas define nama type apapun kecuali "Query" dan "Mutation"
  #type Query => kalian define sebuah routes dengan method GET
  type Query {
    ambilSemuaBuku: [Book]
    ambilBukuDetailById(id: ID!, title: String): Book
  }

  type Mutation {
    #addBook(title: String, author: String, year: Int, imgUrl: String,): ResponseBookMutation
    addBook(inputBook: BookInput): ResponseBookMutation
  }
`;

// resolvers => kalian define controllers kalian
const resolvers = {
  Query: {
    ambilSemuaBuku: () => {
      // kita ambil books dari database
      return books;
    },
    ambilBukuDetailById: (_parent, args, contextValue, info) => {
      console.log(
        args,
        "<<< jadi untuk mendapatkan argumentnya ada di param kedua"
      );
      // seharusnya findOne dari database
      const book = books.find((val) => val.id === Number(args.id));
      return book;
    },
    // contohBelumDidefine: () => {},
  },
  Mutation: {
    addBook: (_, args) => {
      // console.log(args);
      const { title, author, year } = args.inputBook;
      const newBook = {
        id: books.length + 1,
        title,
        author,
        year,
      };
      books.push(newBook);
      return {
        statusCode: 201,
        message: `Successfully add new book with id ${newBook.id}`,
        data: newBook,
      };
      // return null;
    },
  },
};

module.exports = {
  bookTypeDefs: typeDefs,
  bookResolvers: resolvers,
};
