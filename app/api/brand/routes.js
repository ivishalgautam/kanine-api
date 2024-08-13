"use strict";
import controller from "./controller.js";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
};

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      schema: {
        body: schema,
      },
    },
    controller.create
  );
  fastify.put("/:id", {}, controller.updateById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:slug", {}, controller.getBySlug);
  fastify.get("/getById/:id", {}, controller.getById);
}
