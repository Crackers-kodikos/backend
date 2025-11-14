#!/usr/bin/env node

/**
 * Database Seed Runner
 * Run this script to populate the database with test data
 * 
 * Usage:
 * node runSeed.js
 */

import db from '../index.js';
import seedDatabase from './seedsFunctions.js';

async function run() {
  try {
    console.log('🚀 Starting database seed process...\n');

    const seedResult = await seedDatabase();

    console.log('\n✅ Seed process completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

run();
