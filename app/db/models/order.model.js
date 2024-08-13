"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Op, where } from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let OrderModel = null;

const init = async (sequelize) => {
  OrderModel = sequelize.define(
    constants.models.ORDER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "partially_dispatched",
          "dispatched",
          "cancelled",
          "completed"
        ),
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await OrderModel.sync({ alter: true });
};

const create = async ({ order_id, user_id }) => {
  return await OrderModel.create(
    {
      id: order_id,
      user_id: user_id,
    },
    {
      returning: true,
      plain: true,
      raw: true,
    }
  );
};

const get = async (req) => {
  let whereQuery = `WHERE o.user_id = '${req.user_data.id}'`;

  if (req.user_data.role === "admin") {
    whereQuery = "";
  }

  const query = `
  SELECT
      o.*,
      CONCAT(usr.first_name, ' ', usr.last_name) as customer_name,
      usr.email,
      usr.mobile_number
    FROM orders o
    LEFT JOIN users usr ON usr.id = o.user_id
    ${whereQuery}
    ORDER BY o.created_at DESC
  `;

  return await OrderModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await OrderModel.update(
    {
      status: req.body.status,
    },
    {
      where: {
        id: req.params.id || id,
      },
      returning: true,
      raw: true,
      plain: true,
    }
  );

  return rows;
};

const getById = async (id) => {
  const query = `
  SELECT
      o.id,
      o.user_id,
      o.status,
      json_agg(json_build_object(
        'id', oi.id,
        'order_id', oi.order_id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'dispatched_quantity', oi.dispatched_quantity,
        'comment', oi.comment,
        'status', oi.status,
        'title', prd.title,
        'pictures', prd.pictures,
        'slug', prd.slug
      )) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products prd ON prd.id = oi.product_id
    WHERE o.id = '${id}'
    GROUP BY
        o.id,
        o.user_id,
        o.status
  `;

  return await OrderModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await OrderModel.destroy({
    where: { id: req.params.id || id },
  });
};

const countOrders = async (last_30_days = false) => {
  return await OrderModel.findAll({
    attributes: [
      [
        OrderModel.sequelize.fn("COUNT", OrderModel.sequelize.col("id")),
        "total_orders",
      ],
    ],
    plain: true,
    raw: true,
  });
};

const countOrderStats = async () => {
  return await OrderModel.findAll({
    attributes: [
      [
        sequelizeFwk.fn("DATE_TRUNC", "month", sequelizeFwk.col("created_at")),
        "date",
      ],
      [sequelizeFwk.fn("COUNT", sequelizeFwk.col("id")), "Orders"],
    ],
    where: {
      created_at: {
        [Op.gte]: sequelizeFwk.literal("CURRENT_DATE - INTERVAL '12 months'"),
      },
    },
    group: [
      sequelizeFwk.fn("DATE_TRUNC", "month", sequelizeFwk.col("created_at")),
    ],
    raw: true,
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  deleteById: deleteById,
  countOrders: countOrders,
  countOrderStats: countOrderStats,
};
