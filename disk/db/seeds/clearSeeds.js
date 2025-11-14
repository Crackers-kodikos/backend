"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const index_js_1 = __importDefault(require("../index.js"));
const schema = __importStar(require("../schemas/schema.js"));
// Clear all database tables using Drizzle ORM
function clearDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Clearing database tables...");
            // Delete from child tables first to avoid FK constraint errors
            yield index_js_1.default.delete(schema.validatorAssignmentLog).execute();
            console.log("✓ validatorAssignmentLog cleared");
            yield index_js_1.default.delete(schema.orderTracking).execute();
            console.log("✓ orderTracking cleared");
            yield index_js_1.default.delete(schema.orderItems).execute();
            console.log("✓ orderItems cleared");
            yield index_js_1.default.delete(schema.orders).execute();
            console.log("✓ orders cleared");
            yield index_js_1.default.delete(schema.referralLinks).execute();
            console.log("✓ referralLinks cleared");
            yield index_js_1.default.delete(schema.validators).execute();
            console.log("✓ validators cleared");
            yield index_js_1.default.delete(schema.tailors).execute();
            console.log("✓ tailors cleared");
            yield index_js_1.default.delete(schema.magazines).execute();
            console.log("✓ magazines cleared");
            yield index_js_1.default.delete(schema.workshops).execute();
            console.log("✓ workshops cleared");
            yield index_js_1.default.delete(schema.users).execute();
            console.log("✓ users cleared");
            yield index_js_1.default.delete(schema.subscriptionPlans).execute();
            console.log("✓ subscriptionPlans cleared");
            console.log("\n✅ Database cleared successfully!");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error clearing database:", error);
            process.exit(1);
        }
    });
}
clearDatabase();
