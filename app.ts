import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import errorHandler from "./middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import magazineRoutes from "./routes/magazineRoutes.js";
import orderRoutes from './routes/orderRoutes.js';
import validatorRoutes from './routes/validatorRoutes.js';
/* 
import tailorRoutes from './routes/tailorRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import orderTrackingRoutes from './routes/orderTrackingRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js'; 
*/
const app = express();
const port = config.port || 80;

// Middleware

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: config.allowedOrigins || "http://localhost:8081", //whatever your default is,
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

app.use(cookieParser());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Tailoring Workshop API",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/workshop", workshopRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/magazine", magazineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/validator", validatorRoutes);
/* TODO - Uncomment when routes are ready:
app.use("/api/tailor", tailorRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/tracking", orderTrackingRoutes);
app.use("/api/subscription", subscriptionRoutes);
*/

app.use(errorHandler);

app.get("/", async (req, res) => {
  res.send("server is running nosssw");
});

app.listen(port, "0.0.0.0", async () => {
  console.log(`server started on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});

export default app;
