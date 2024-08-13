import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import cors from "@fastify/cors";
import { dirname } from "path";
import path from "path";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import multer from "fastify-multer";

// import internal modules
import authRoutes from "./app/api/auth/routes.js";
import pg_database from "./app/db/postgres.js";
import routes from "./app/routes/v1/index.js";
import uploadFileRoutes from "./app/api/upload_files/routes.js";
import productController from "./app/api/products/controller.js";
import categoriesController from "./app/api/categories/controller.js";
import brandsController from "./app/api/brand/controller.js";
import queryController from "./app/api/query/controller.js";
import userController from "./app/api/users/controller.js";
import querySchema from "./app/api/query/schema.js";
/*
  Register External packages, routes, database connection
*/

export default (app) => {
  app.register(fastifyStatic, {
    root: path.join(dirname(fileURLToPath(import.meta.url), "public")),
  });

  app.register(cors, { origin: "*" });
  app.register(pg_database);
  app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Set the limit to 5 GB or adjust as needed
  });
  // Increase the payload size limit
  app.register(routes, { prefix: "v1" });
  app.register(authRoutes, { prefix: "v1/auth" });

  app.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
  });

  // app.register(multer.contentParser);

  app.register(uploadFileRoutes, { prefix: "v1/upload" });
  app.post("/v1/users", {}, userController.create);

  // products
  app.get("/v1/products", {}, productController.get);
  app.get("/v1/update-tags", {}, productController.test);
  app.get("/v1/products/:slug", {}, productController.getBySlug);
  app.get(
    "/v1/products/getByCategory/:slug",
    {},
    productController.getByCategory
  );
  app.get("/v1/products/getByBrand/:slug", {}, productController.getByBrand);
  app.get("/v1/products/search", {}, productController.searchProducts);

  // categories
  app.get("/v1/categories", {}, categoriesController.get);
  app.get("/v1/categories/:slug", {}, categoriesController.getBySlug);

  // brand
  app.get("/v1/brands", {}, brandsController.get);

  // query
  app.post(
    "/v1/queries",
    { schema: querySchema.create },
    queryController.create
  );
};
