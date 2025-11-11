"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const env_js_1 = require("./config/env.js");
const error_middleware_js_1 = __importDefault(require("./middleware/error.middleware.js"));
const app = (0, express_1.default)();
const port = env_js_1.config.port || 80;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: env_js_1.config.allowedOrigins || "http://localhost:8081", //whatever your default is,
    credentials: true, // Allow credentials (cookies, authorization headers)
}));
app.use((0, cookie_parser_1.default)());
app.use(authRoutes_js_1.default);
app.use(error_middleware_js_1.default);
app.get("/", async (req, res) => {
    res.send("server is running");
});
app.listen(port, "0.0.0.0", async () => {
    console.log(`server started on port ${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map