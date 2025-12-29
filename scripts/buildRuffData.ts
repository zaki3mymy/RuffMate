#!/usr/bin/env node
/**
 * Build script to generate Ruff rules data
 * This script runs before the main build to ensure up-to-date rule data
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateData } from './validateData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Paths
 */
const PATHS = {
  publicData: resolve(__dirname, '../public/data/ruff-rules.json'),
  distData: resolve(__dirname, '../dist/data/ruff-rules.json'),
} as const;

/**
 * Ensure directory exists
 */
async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * Read JSON file
 */
async function readJSON(filePath: string): Promise<unknown> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write JSON file
 */
async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await ensureDir(filePath);
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content + '\n', 'utf-8');
}

/**
 * Main build process
 */
async function main(): Promise<void> {
  console.log('🚀 Building Ruff rules data...\n');

  try {
    // Step 1: Read existing data from public/
    // In Phase 3+, this will be replaced with actual fetching and parsing
    console.log('📖 Reading existing rule data...');
    const data = await readJSON(PATHS.publicData);
    console.log('✓ Data loaded successfully\n');

    // Step 2: Validate data structure
    console.log('🔍 Validating data structure...');
    const validation = validateData(data);

    if (!validation.valid) {
      console.error('❌ Validation failed:');
      validation.errors.forEach((error) => {
        console.error(`  - ${error}`);
      });
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Validation warnings:');
      validation.warnings.forEach((warning) => {
        console.warn(`  - ${warning}`);
      });
      console.log('');
    }

    console.log('✓ Validation passed\n');

    // Step 3: Update build timestamp
    const updatedData = {
      ...data,
      buildTimestamp: new Date().toISOString(),
    };

    // Step 4: Write to dist/ directory
    console.log('💾 Writing data to dist/...');
    await writeJSON(PATHS.distData, updatedData);
    console.log('✓ Data written successfully\n');

    // Summary
    const ruffData = data as { rules?: unknown[]; categories?: unknown[] };
    console.log('📊 Build Summary:');
    console.log(`  Rules: ${ruffData.rules?.length ?? 0}`);
    console.log(`  Categories: ${ruffData.categories?.length ?? 0}`);
    console.log(`  Output: ${PATHS.distData}`);
    console.log('\n✅ Ruff rules data build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run main process
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
