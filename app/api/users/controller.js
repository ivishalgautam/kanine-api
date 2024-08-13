"use strict";

import table from "../../db/models.js";
import hash from "../../lib/encryption/index.js";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { sendOtp } from "../../helpers/interaktApi.js";
import csv from "csv-parser";
import { sendCredentials } from "../../helpers/mailer.js";
import authToken from "../../helpers/auth.js";
import { ValidationErrorItemOrigin } from "sequelize";

const create = async (req, res) => {
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
    console.log({ otp });
    const data = await table.UserModel.create(req);

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
        phone: userData.mobile_number,
        otp: otp,
      });
    }

    const registrationTemplate = path.join(
      fileURLToPath(import.meta.url),
      "..",
      "..",
      "..",
      "..",
      "views",
      "registration.ejs"
    );
    const thankYouTemplate = path.join(
      fileURLToPath(import.meta.url),
      "..",
      "..",
      "..",
      "..",
      "views",
      "thank-you.ejs"
    );

    const emailTemplate = fs.readFileSync(registrationTemplate, "utf-8");
    const thankYouEmailTemplate = fs.readFileSync(thankYouTemplate, "utf-8");

    const template = ejs.render(emailTemplate, {
      fullname: `${userData.first_name} ${userData.last_name ?? ""}`,
      username: userData.username,
      password: userData.password_string ?? "",
    });

    const thankYou = ejs.render(thankYouEmailTemplate, {
      fullname: `${userData.first_name} ${userData.last_name ?? ""}`,
    });

    // await sendCredentials(template, userData?.email);
    // await sendCredentials(thankYou, userData?.email);

    return res.send({ status: true });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const update = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    const user = await table.UserModel.update(req);

    if (user && req.body.password) {
      req.body.new_password = req.body.password;
      await table.UserModel.updatePassword(req, req.user_data.id);
    }

    if (user.is_active) {
      // Read the email template file
      const emailTemplatePath = path.join(
        fileURLToPath(import.meta.url),
        "..",
        "..",
        "..",
        "..",
        "views",
        "credentials.ejs"
      );
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

      // Render the email template with user data
      const template = ejs.render(emailTemplate, {
        fullname: `${user.first_name} ${user.last_name ?? ""}`,
        username: user.username,
        password: user.password_string ?? "",
      });

      if (!record.is_active) {
        await sendCredentials(template, user?.email);
      }
    }
    return res.send({ status: true, message: "Updated" });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const updateStatus = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }
    const data = await table.UserModel.updateStatus(
      req.params.id,
      req.body.is_active
    );

    if (data.is_active) {
      // Read the email template file
      const emailTemplatePath = path.join(
        fileURLToPath(import.meta.url),
        "..",
        "..",
        "..",
        "..",
        "views",
        "credentials.ejs"
      );
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

      // Render the email template with user data
      const template = ejs.render(emailTemplate, {
        fullname: `${data.first_name} ${data.last_name}`,
        username: data.username,
        password: 1234,
      });

      if (!record.is_active) {
        await sendCredentials(template, data?.email);
      }
    }

    res.send({
      status: true,
      message: data?.is_active ? "Customer Active." : "Customer Inactive.",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.UserModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    return res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    return res.send({ status: true, data: await table.UserModel.get() });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }
    delete record.password;

    return res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const updatePassword = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);

    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    const verify_old_password = await hash.verify(
      req.body.old_password,
      record.password
    );

    if (!verify_old_password) {
      return res
        .code(404)
        .send({ message: "Incorrect password. Please enter a valid password" });
    }

    await table.UserModel.updatePassword(req);
    return res.send({
      status: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const checkUsername = async (req, res) => {
  try {
    const user = await table.UserModel.getByUsername(req);
    if (user) {
      return res.code(409).send({
        status: false,
        message: "username already exists try with different username",
      });
    }
    return res.send({
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const getUser = async (req, res) => {
  try {
    const record = await table.UserModel.getById(undefined, req.user_data.id);

    if (!record) {
      return res.code(401).send({ status: false, messaege: "invalid token" });
    }

    return res.send(req.user_data);
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = await table.UserModel.getByResetToken({
      ...req,
      params: {
        token: req.body.token,
      },
    });

    if (!token) {
      return res.code(401).send({ status: false, message: "Invalid url!" });
    }

    const updateConfirmation = await table.UserModel.updatePassword(
      req,
      token.id
    );

    if (updateConfirmation) {
      await table.UserModel.update({
        params: { id: token.id },
        body: {
          reset_password_token: "",
        },
      });
    }

    return res.send({
      status: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

async function importCustomers(req, res) {
  const processRow = async (data) => {
    req.body = {
      username: String(data.username).toLowerCase(),
      email: data.email,
      mobile_number: data.phone,
      country_code: data.country_code,
      first_name: data.name,
      last_name: "",
      password: data.password_string,
    };

    const record = await table.UserModel.getByPhone({
      body: { phone: req.body.mobile_number },
    });
    const username = await table.UserModel.getByUsername({
      body: { username: req.body.username },
    });

    if (!record && !username) {
      await table.UserModel.create(req);
    }
  };

  try {
    if (!req.file) {
      return res.code(400).send({ message: "No file uploaded." });
    }

    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", async (data) => {
          results.push(data);
        })
        .on("end", () => {
          resolve();
          fs.unlinkSync(req.file.path);
        })
        .on("error", (error) => {
          reject();
        });
    });

    for (const row of results) {
      await processRow(row);
    }

    res.send({ message: "Customers imported successfully" });
  } catch (error) {
    console.log(error);
    res.code(500).send({ message: error.message });
  }
}

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  checkUsername: checkUsername,
  updatePassword: updatePassword,
  getUser: getUser,
  resetPassword: resetPassword,
  updateStatus: updateStatus,
  importCustomers: importCustomers,
};
