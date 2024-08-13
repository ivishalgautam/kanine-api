"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/admin/getAll", {}, controller.get);
  fastify.put("/:id", {}, controller.updateById);
  fastify.put("/publish/:id", {}, controller.publishProductById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/getById/:id", {}, controller.getById);
}
