#!/usr/bin/env node

/**
 * Analyze local estate sale images without scraping
 *
 * Usage:
 *   yarn build && node dist/estate-scraper/analyze-local.js <image-directory>
 *
 * This is useful when:
 * - You've manually downloaded images from a JavaScript-heavy site
 * - You have screenshots or photos from an estate sale
 * - The website scraper doesn't work for a particular site
 */

import { loadImagesFromDirectory } from './downloader';
import { analyzeImagesForValue, formatAnalysisResults } from './analyzer';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Estate Sale Image Analyzer
==========================

Analyzes local images for valuable items using Claude Opus 4.5.

Usage:
  node dist/estate-scraper/analyze-local.js <image-directory> [--api-key <key>]

Arguments:
  image-directory        Path to directory containing estate sale images

Options:
  --api-key <key>        Anthropic API key (or set ANTHROPIC_API_KEY env var)
  --help                 Show this help message

Example:
  # Download images manually from a website, then:
  node dist/estate-scraper/analyze-local.js ./my-estate-images

Environment Variables:
  ANTHROPIC_API_KEY      Your Anthropic API key (required)
`);
    process.exit(0);
  }

  const imageDir = args[0];
  let apiKey: string | undefined;

  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--api-key' && args[i + 1]) {
      apiKey = args[i + 1];
      i++;
    }
  }

  try {
    console.log('\n🔍 Estate Sale Image Analyzer\n');

    // Validate directory
    if (!fs.existsSync(imageDir)) {
      console.error(`❌ Directory not found: ${imageDir}`);
      process.exit(1);
    }

    if (!fs.statSync(imageDir).isDirectory()) {
      console.error(`❌ Path is not a directory: ${imageDir}`);
      process.exit(1);
    }

    // Load images
    console.log(`Loading images from: ${imageDir}\n`);
    const images = await loadImagesFromDirectory(imageDir);

    if (images.length === 0) {
      console.error(`❌ No image files found in ${imageDir}`);
      console.log('\nSupported formats: .jpg, .jpeg, .png, .webp, .gif\n');
      process.exit(1);
    }

    console.log(`✓ Found ${images.length} image(s)\n`);

    // Analyze with Claude Opus 4.5
    console.log('Analyzing images with Claude Opus 4.5...\n');
    const analysisResults = await analyzeImagesForValue(images, apiKey);

    // Display results
    const formattedResults = formatAnalysisResults(analysisResults);
    console.log(formattedResults);

    // Save results
    const resultsPath = path.join(imageDir, 'analysis-results.txt');
    fs.writeFileSync(resultsPath, formattedResults);
    console.log(`\n💾 Results saved to: ${resultsPath}\n`);

    const jsonPath = path.join(imageDir, 'analysis-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ analysis: analysisResults }, null, 2));
    console.log(`💾 JSON data saved to: ${jsonPath}\n`);

    console.log('✅ Analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
