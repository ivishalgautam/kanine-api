"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes, Deferrable } from "sequelize";

let OtpModel = null;

const init = async (sequelize) => {
  OtpModel = sequelize.define(
    constants.models.OTP_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await OtpModel.sync({ alter: true });
};

const create = async ({ phone, otp }) => {
  return await OtpModel.create({
    phone: phone,
    otp: otp,
  });
};

const update = async ({ phone, otp }) => {
  return await OtpModel.update(
    {
      otp: otp,
    },
    {
      where: {
        phone: phone,
      },
      returning: true,
      raw: true,
    }
  );
};

const getByPhone = async (phone) => {
  return await OtpModel.findOne({
    where: {
      phone: phone,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteByPhone = async (phone) => {
  return await OtpModel.destroy({
    where: { phone: phone },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getByPhone: getByPhone,
  deleteByPhone: deleteByPhone,
};
