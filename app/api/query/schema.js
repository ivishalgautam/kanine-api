const create = {
  body: {
    type: "object",
    required: ["name", "email", "address", "phone", "subject", "message"],
    properties: {
      name: { type: "string", minLength: 3 },
      email: { type: "string", minLength: 3 },
      address: { type: "string", minLength: 3 },
      phone: { type: "string", minLength: 3 },
      subject: { type: "string", minLength: 3 },
      message: { type: "string", minLength: 3 },
    },
  },
};

export default { create: create };
