import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import productRoutes from "../../api/products/routes.js";
import categoryRoutes from "../../api/categories/routes.js";
import brandRoutes from "../../api/brand/routes.js";
import orderRoutes from "../../api/order/routes.js";
import enquiryRoutes from "../../api/enquiry/routes.js";
import tempCartRoutes from "../../api/cart/routes.js";
import queryRoutes from "../../api/query/routes.js";
import dashboardRoutes from "../../api/dashboard/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(productRoutes, { prefix: "products" });
  fastify.register(categoryRoutes, { prefix: "categories" });
  fastify.register(brandRoutes, { prefix: "brands" });
  fastify.register(orderRoutes, { prefix: "orders" });
  fastify.register(enquiryRoutes, { prefix: "enquiries" });
  fastify.register(tempCartRoutes, { prefix: "cart" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(dashboardRoutes, { prefix: "dashboard" });
}
