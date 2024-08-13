"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let CartModel = null;

const init = async (sequelize) => {
  CartModel = sequelize.define(
    constants.models.CART_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.PRODUCT_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await CartModel.sync({ alter: true });
};

const create = async (req) => {
  return await CartModel.create({
    user_id: req.user_data.id,
    product_id: req.body.product_id,
    quantity: req.body.quantity,
  });
};

const get = async (req) => {
  const query = `
    SELECT 
      crt.*,
      prd.title,
      prd.description,
      prd.pictures,
      prd.moq,
      prd.id as product_id,
      brnd.name as brand
    FROM ${constants.models.CART_TABLE} crt
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd on prd.id = crt.product_id
    LEFT JOIN ${constants.models.BRAND_TABLE} brnd on brnd.id = prd.brand_id
    WHERE crt.user_id = '${req.user_data.id}';
  `;

  return await CartModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (req, id) => {
  return await CartModel.findOne({
    where: {
      id: req.params.id || id,
    },
    raw: true,
    plain: true,
  });
};

const getByUserAndProductId = async (req) => {
  return await CartModel.findOne({
    where: {
      user_id: req.user_data.id,
      product_id: req.body.product_id,
    },
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await CartModel.destroy({
    where: { id: req?.params?.id || id },
    returning: true,
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
  getByUserAndProductId: getByUserAndProductId,
};
