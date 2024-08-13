"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import { generateOrderId } from "../../helpers/generateId.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    const orderId = generateOrderId();
    const order = await table.OrderModel.create({
      order_id: orderId,
      user_id: req.body.user_id ?? req.user_data.id,
    });

    if (order) {
      req.body?.items.forEach(
        async ({ _id: tempCartProductId, product_id, quantity }) => {
          const newOrder = await table.OrderItemModel.create({
            order_id: order.id,
            product_id,
            quantity,
          });

          if (newOrder) {
            await table.TempCartModel.deleteById(req, tempCartProductId);
          }
        }
      );
    }

    res.send({ status: true, message: "Enquiry sent." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const updateById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Order not found!" });
    }

    const data = await table.OrderModel.update(req, req.params.id);

    if (data) {
      req.body.items.forEach(
        async ({ _id: id, quantity, dispatched_quantity, comment, status }) => {
          await table.OrderItemModel.update({
            id,
            quantity,
            dispatched_quantity: dispatched_quantity ?? 0,
            comment,
            status,
          });
        }
      );
    }

    res.send({ status: true, message: "updated" });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "order not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const data = await table.OrderModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.OrderModel.deleteById(req, req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "order not found!" });

    res.send({ status: true, message: "order deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteOrderItemById = async (req, res) => {
  try {
    const record = await table.OrderItemModel.getById(
      req,
      req.params.order_item_id
    );

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "order item not found!" });

    await table.OrderItemModel.deleteById(req, req.params.order_item_id);
    res.send({ status: true, message: "order item deleted.", data: record });
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
  getById: getById,
  deleteOrderItemById: deleteOrderItemById,
};
