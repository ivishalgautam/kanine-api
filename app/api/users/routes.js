"use strict";

import controller from "./controller.js";
import jwtVerify from "../../helpers/auth.js";
import multer from "fastify-multer";
import csv from "csv-parser";
import fs from "fs";

// Set up multer storage and file filter if needed
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify the directory for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export default async function routes(fastify, options) {
  fastify.post("/:id/change-password", {}, controller.updatePassword);
  fastify.post(
    "/import",
    { preHandler: upload.single("file") },
    controller.importCustomers
  );
  fastify.put("/:id", {}, controller.update);
  fastify.put("/status/:id", {}, controller.updateStatus);
  fastify.get("/me", {}, controller.getUser);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
}
