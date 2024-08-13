"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.put("/:id", {}, controller.updateById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete(
    "/enquiry-items/:enquiry_item_id",
    {},
    controller.deleteEnquiryItemById
  );
  fastify.post("/convertToOrder/:id", {}, controller.convertToOrder);
}
