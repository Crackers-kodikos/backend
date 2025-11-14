#!/usr/bin/env node
"use strict";
/**
 * Database Seed Runner
 * Run this script to populate the database with test data
 *
 * Usage:
 * node runSeed.js
 */
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
const seedsFunctions_js_1 = __importDefault(require("./seedsFunctions.js"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🚀 Starting database seed process...\n');
            const seedResult = yield (0, seedsFunctions_js_1.default)();
            console.log('\n✅ Seed process completed successfully!');
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Seed process failed:', error);
            process.exit(1);
        }
    });
}
run();
