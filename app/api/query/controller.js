"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    await table.QueryModel.create(req);
    res.send({ status: true, message: "Query sent." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.QueryModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Query not found!" });
    }

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const queries = await table.QueryModel.get(req);
    res.send({ status: true, data: queries });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.QueryModel.getById(req, req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Query not found!" });

    await table.QueryModel.deleteById(req, req.params.id);
    res.send({ status: true, message: "Query deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

export default {
  create: create,
  get: get,
  deleteById: deleteById,
  getById: getById,
};
