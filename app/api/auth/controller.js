"use strict";

import hash from "../../lib/encryption/index.js";

import table from "../../db/models.js";
import authToken from "../../helpers/auth.js";
import crypto from "crypto";
import { sendOtp } from "../../helpers/interaktApi.js";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendCredentials } from "../../helpers/mailer.js";

const verifyUserCredentials = async (req, res) => {
  let userData;
  try {
    userData = await table.UserModel.getByUsername(req);

    if (!userData) {
      return res.code(404).send({ message: "User not found!" });
    }

    if (!userData.is_active) {
      return res
        .code(400)
        .send({ message: "User not active. Please contact administrator!" });
    }

    let passwordIsValid = await hash.verify(
      req.body.password,
      userData.password
    );

    if (!passwordIsValid) {
      return res.code(400).send({ message: "Invalid credentials" });
    }

    if (userData.role !== "admin" && !userData.is_verified) {
      const otp = crypto.randomInt(100000, 999999);

      await sendOtp({
        country_code: userData?.country_code,
        mobile_number: userData?.mobile_number,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        otp,
      });
    }

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
    const refreshToken = authToken.generateRefreshToken(userData);

    return res.send({
      status: true,
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      user_data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.code(500).send({ status: false, error });
  }
};

const createNewUser = async (req, res) => {
  try {
    const record = await table.UserModel.getByUsername(req);
    const phoneExist = await table.UserModel.getByPhone(
      req,
      req.body.mobile_number
    );

    if (record) {
      return res.code(409).send({
        status: false,
        message:
          "User already exists with username. Please try with different username",
      });
    }

    if (phoneExist) {
      return res.code(409).send({
        status: false,
        message:
          "User already exists with mobile number. Please try with different mobile number",
      });
    }

    const otp = crypto.randomInt(100000, 999999);
    const data = await table.UserModel.create(req);
    console.log({ otp });
    const userData = await table.UserModel.getById(req, data.dataValues.id);

    // const resp = await sendOtp({
    //   country_code: userData?.country_code,
    //   mobile_number: userData?.mobile_number,
    //   first_name: userData?.first_name,
    //   last_name: userData?.last_name,
    //   otp,
    // });

    // ! change condition on 'resp' result
    if (true) {
      await table.OtpModel.create({
        phone: userData?.mobile_number,
        otp: otp,
      });
    }

    return res.send({ status: true, phone: req.body.mobile_number });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const verifyRefreshToken = async (req, res) => {
  return authToken.verifyRefreshToken(req, res);
};

const sendResetToken = async (req, res) => {
  try {
    const record = await table.UserModel.getByPhone(req);
    if (!record) {
      return res.code(401).send({ status: false, message: "User not found!" });
    }

    // console.log({ record });

    const [jwtToken, expiresIn] = authToken.generateAccessToken({
      id: record.id,
      username: record.username,
      fullname: `${record.first_name}  ${
        record.last_name ? record.last_name : ""
      }`,
    });

    const updateConfirmatiion = await table.UserModel.update({
      body: { reset_password_token: jwtToken },
      params: { id: record.id },
    });
    if (updateConfirmatiion) {
      const resetPasswordTemplate = path.join(
        fileURLToPath(import.meta.url),
        "..",
        "..",
        "..",
        "..",
        "views",
        "reset-password.ejs"
      );
      const resetTemplate = fs.readFileSync(resetPasswordTemplate, "utf-8");

      const template = ejs.render(resetTemplate, {
        fullname: `${record.first_name} ${record.last_name ?? ""}`,
        token: jwtToken,
      });

      await sendCredentials(template, record?.email, "Reset password");
    }

    return res.send({
      status: true,
      message:
        "We have sent an reset password link to your registered email id.",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

export default {
  verifyUserCredentials,
  createNewUser,
  verifyRefreshToken,
  sendResetToken,
};
