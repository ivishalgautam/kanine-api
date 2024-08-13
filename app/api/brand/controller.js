"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";
import fileController from "../upload_files/controller.js";

const { BAD_REQUEST, NOT_FOUND, FORBIDDEN, INTERNAL_SERVER_ERROR } =
  constants.http.status;

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;
    const record = await table.BrandModel.getBySlug(req, slug);

    if (record)
      return res.code(BAD_REQUEST).send({
        status: false,
        message: "Brand exist with this name!",
      });

    const product = await table.BrandModel.create(req);
    res.send({ status: true, data: product });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const updateById = async (req, res) => {
  try {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;

    const record = await table.BrandModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Brand not found!" });
    }

    const slugExist = await table.BrandModel.getBySlug(req, req.body.slug);

    // Check if there's another Product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(FORBIDDEN)
        .send({ message: "Brand exist with this title!" });

    res.send({
      status: true,
      data: await table.BrandModel.update(req, req.params.id),
    });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getBySlug = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.BrandModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Brand not found!" });
    }

    res.send({
      status: true,
      data: await table.BrandModel.getById(req, req.params.id),
    });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.BrandModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Brand not found!" });
    }

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const data = await table.BrandModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.BrandModel.deleteById(req, req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Brand not found!" });

    res.send({ status: true, message: "Brand deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

export default {
  create: create,
  get: get,
  updateById: updateById,
  deleteById: deleteById,
  getBySlug: getBySlug,
  getById: getById,
};
