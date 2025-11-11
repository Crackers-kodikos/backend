import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import { config } from "./config/env.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();
const port = config.port || 80;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.allowedOrigins || "http://localhost:8081", //whatever your default is,
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(cookieParser());

app.use(authRouter);
app.use(errorHandler);
app.get("/", async (req, res) => {
  res.send("server is running");
});

app.listen(port, "0.0.0.0", async () => {
  console.log(`server started on port ${port}`);
});

export default app;
