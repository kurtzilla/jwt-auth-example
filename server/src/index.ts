import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import cors from "cors";
import { registerRoutes } from "./Routes";

(async () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.ALLOW_CORS_HOST,
      credentials: true,
    })
  );
  app.use(cookieParser());

  // register routes
  registerRoutes(app);

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log(
      `express server started on ${process.env.SERVER_DOMAIN}:${process.env.PORT}`
    );
  });
})();
