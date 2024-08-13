const signUpSchema = {
  body: {
    type: "object",
    required: [
      "username",
      "password",
      "first_name",
      "email",
      "mobile_number",
      "country_code",
    ],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 3 },
      first_name: { type: "string", minLength: 3 },
      email: { type: "string", minLength: 3 },
      mobile_number: { type: "string", minLength: 3 },
      country_code: { type: "string", minLength: 3 },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 3 },
    },
  },
};

const sendOtpSchema = {
  body: {
    type: "object",
    required: ["phone"],
    properties: {
      phone: { type: "string" },
    },
  },
};

const verifyOtpSchema = {
  body: {
    type: "object",
    required: ["phone", "otp"],
    properties: {
      phone: { type: "string" },
      otp: { type: "string" },
    },
  },
};

export default {
  signUpSchema: signUpSchema,
  sendOtpSchema: sendOtpSchema,
  verifyOtpSchema: verifyOtpSchema,
  loginSchema: loginSchema,
};
