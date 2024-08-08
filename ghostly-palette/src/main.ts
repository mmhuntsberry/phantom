import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { resolvers } from "./resolvers/theme";
import mysql from "mysql2/promise";

const {
  GHOSTLY_USERNAME,
  GHOSTLY_PASSWORD,
  GHOSTLY_PORT,
  GHOSTLY_HOST,
  GHOSTLY_DATABASE,
} = process.env;

console.log(
  GHOSTLY_USERNAME,
  GHOSTLY_PASSWORD,
  GHOSTLY_PORT,
  GHOSTLY_HOST,
  GHOSTLY_DATABASE
);

const connection = mysql.createConnection({
  host: GHOSTLY_HOST,
  user: GHOSTLY_USERNAME,
  password: GHOSTLY_PASSWORD,
  database: GHOSTLY_DATABASE,
  port: 25060,
});

// import typeDefs from "./schemas/theme.graphql";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
type Theme {
  id: ID!
  name: String!
  sizes: [Size]
}

type Size {
  id: ID!
  rem: String!
}


type Query {
  getAllThemes: [Theme]
  theme(id: ID!): Theme
}
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello world!";
  },
  getAllThemes: async () => {
    const [rows] = await (await connection).query("SELECT * FROM themes");
    return rows;
  },
  getAllSizes: async () => {
    const [rows] = await (await connection).query("SELECT * FROM sizes");
    return rows;
  },
  theme: async ({ id }) => {
    const [themeResult] = (await (
      await connection
    ).query("SELECT * FROM themes WHERE id = ?", [
      id,
    ])) as mysql.RowDataPacket[];

    // Check if a theme was found
    if (themeResult.length === 0) {
      return null; // Or handle the error as per your application's logic
    }

    const theme = themeResult[0];

    // Fetch the associated sizes for the theme
    const [sizesResult] = (await (
      await connection
    ).query(
      `SELECT s.* FROM sizes s
        JOIN themeSizes ts ON s.id = ts.size_id
        WHERE ts.theme_id = ?`,
      [id]
    )) as mysql.RowDataPacket[];

    // Attach the sizes to the theme
    theme.sizes = sizesResult;

    return theme;
  },
};

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
