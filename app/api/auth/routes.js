"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";
import otpController from "../otp/controller.js";
import schema from "./schema.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/login",
    { schema: schema.loginSchema },
    controller.verifyUserCredentials
  );
  fastify.post(
    "/signup",
    { schema: schema.createUserSchema },
    controller.createNewUser
  );
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/reset-password", {}, controller.sendResetToken);
  fastify.put("/reset-password", {}, userController.resetPassword);
  fastify.post(
    "/otp/send",
    { schema: schema.sendOtpSchema },
    otpController.create
  );
  fastify.post(
    "/otp/verify",
    { schema: schema.verifyOtpSchema },
    otpController.verify
  );
}
