import mysql from "mysql2/promise";

const {
  GHOSTLY_USERNAME,
  GHOSTLY_PASSWORD,
  GHOSTLY_PORT,
  GHOSTLY_HOST,
  GHOSTLY_DATABASE,
} = process.env;

const db = mysql.createPool({
  host: GHOSTLY_HOST,
  user: GHOSTLY_USERNAME,
  password: GHOSTLY_PASSWORD,
  database: GHOSTLY_DATABASE,
  pool: {
    port: GHOSTLY_PORT,
  },
});

const resolvers = {
  Query: {
    getAllThemes: async () => {
      const [rows] = await db.query("SELECT * FROM themes");
      console.log(rows);
      return rows;
    },
  },
  Mutation: {},
};

export { resolvers };
