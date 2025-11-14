"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./config/env.js");
const error_middleware_js_1 = __importDefault(require("./middleware/error.middleware.js"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_js_1 = __importDefault(require("./config/swagger.js"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const workshopRoutes_js_1 = __importDefault(require("./routes/workshopRoutes.js"));
const referralRoutes_js_1 = __importDefault(require("./routes/referralRoutes.js"));
const magazineRoutes_js_1 = __importDefault(require("./routes/magazineRoutes.js"));
const orderRoutes_js_1 = __importDefault(require("./routes/orderRoutes.js"));
const validatorRoutes_js_1 = __importDefault(require("./routes/validatorRoutes.js"));
const tailorRoutes_js_1 = __importDefault(require("./routes/tailorRoutes.js"));
const orderItemRoutes_js_1 = __importDefault(require("./routes/orderItemRoutes.js"));
const trackingRoutes_js_1 = __importDefault(require("./routes/trackingRoutes.js"));
const subscriptionRoutes_js_1 = __importDefault(require("./routes/subscriptionRoutes.js"));
const app = (0, express_1.default)();
const port = env_js_1.config.port || 80;
// Middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cors_1.default)({
    origin: env_js_1.config.allowedOrigins || "http://localhost:8081", //whatever your default is,
    credentials: true, // Allow credentials (cookies, authorization headers)
}));
app.use((0, cookie_parser_1.default)());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_js_1.default, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Tailoring Workshop API",
}));
app.use("/api/auth", authRoutes_js_1.default);
app.use("/api/workshop", workshopRoutes_js_1.default);
app.use("/api/referral", referralRoutes_js_1.default);
app.use("/api/magazine", magazineRoutes_js_1.default);
app.use("/api/orders", orderRoutes_js_1.default);
app.use("/api/validator", validatorRoutes_js_1.default);
app.use("/api/tailor", tailorRoutes_js_1.default);
app.use("/api/order-items", orderItemRoutes_js_1.default);
app.use("/api/tracking", trackingRoutes_js_1.default);
app.use("/api/subscription", subscriptionRoutes_js_1.default);
app.use(error_middleware_js_1.default);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("server is running nosssw");
}));
app.listen(port, "0.0.0.0", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`server started on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
}));
exports.default = app;
