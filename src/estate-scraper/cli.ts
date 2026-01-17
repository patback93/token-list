#!/usr/bin/env node

import { scrapeEstateSale } from './scraper';
import { downloadImages } from './downloader';
import { analyzeImagesForValue, formatAnalysisResults } from './analyzer';
import * as fs from 'fs';
import * as path from 'path';

interface CliOptions {
  url: string;
  outputDir?: string;
  skipDownload?: boolean;
  apiKey?: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Estate Sale Scraper & Analyzer
==============================

Scrapes estate sale listings, downloads images, and uses Claude Opus 4.5 to
identify potentially valuable items.

Usage:
  yarn estate-scrape <url> [options]

Arguments:
  url                    URL of the estate sale listing

Options:
  --output-dir <dir>     Directory to save images (default: /tmp/estate-sale-images)
  --skip-download        Skip downloading, analyze existing images in output-dir
  --api-key <key>        Anthropic API key (or set ANTHROPIC_API_KEY env var)
  --help, -h             Show this help message

Examples:
  # Scrape and analyze an estate sale
  yarn estate-scrape https://www.estatesales.net/CA/Yorba-Linda/92887/4773582

  # Use custom output directory
  yarn estate-scrape https://example.com/sale --output-dir ./my-images

  # Analyze existing images without downloading
  yarn estate-scrape --skip-download --output-dir ./my-images

Environment Variables:
  ANTHROPIC_API_KEY      Your Anthropic API key (required for analysis)

`);
    process.exit(0);
  }

  const options: CliOptions = {
    url: args[0],
    outputDir: '/tmp/estate-sale-images'
  };

  // Parse command line options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--skip-download') {
      options.skipDownload = true;
    } else if (args[i] === '--api-key' && args[i + 1]) {
      options.apiKey = args[i + 1];
      i++;
    }
  }

  try {
    console.log('\n🏠 Estate Sale Scraper & Analyzer\n');

    let imageUrls: string[] = [];
    let listingInfo: any = null;

    if (!options.skipDownload) {
      // Step 1: Scrape the estate sale listing
      console.log('Step 1: Scraping estate sale listing...\n');
      listingInfo = await scrapeEstateSale(options.url);

      console.log(`\n📋 Sale Information:`);
      console.log(`   Title: ${listingInfo.title}`);
      console.log(`   Dates: ${listingInfo.dates}`);
      console.log(`   Location: ${listingInfo.location}`);
      if (listingInfo.description) {
        console.log(`   Description: ${listingInfo.description.substring(0, 150)}...`);
      }
      console.log(`   Images Found: ${listingInfo.imageUrls.length}\n`);

      if (listingInfo.imageUrls.length === 0) {
        console.error('❌ No images found in the listing. Cannot proceed with analysis.');
        process.exit(1);
      }

      imageUrls = listingInfo.imageUrls;

      // Step 2: Download images
      console.log('Step 2: Downloading images...\n');
      const downloadedImages = await downloadImages(imageUrls, options.outputDir);

      if (downloadedImages.length === 0) {
        console.error('❌ Failed to download any images. Cannot proceed with analysis.');
        process.exit(1);
      }

      // Step 3: Analyze images with Claude Opus 4.5
      console.log('\nStep 3: Analyzing images for valuable items...\n');
      const analysisResults = await analyzeImagesForValue(downloadedImages, options.apiKey);

      // Step 4: Display results
      const formattedResults = formatAnalysisResults(analysisResults);
      console.log(formattedResults);

      // Save results to file
      const resultsPath = path.join(options.outputDir!, 'analysis-results.txt');
      fs.writeFileSync(resultsPath, formattedResults);
      console.log(`\n💾 Results saved to: ${resultsPath}\n`);

      // Also save as JSON
      const jsonPath = path.join(options.outputDir!, 'analysis-results.json');
      fs.writeFileSync(jsonPath, JSON.stringify({
        listing: listingInfo,
        analysis: analysisResults
      }, null, 2));
      console.log(`💾 JSON data saved to: ${jsonPath}\n`);

    } else {
      // Skip download mode - analyze existing images
      console.log('Step 1: Loading existing images...\n');

      if (!fs.existsSync(options.outputDir!)) {
        console.error(`❌ Directory not found: ${options.outputDir}`);
        process.exit(1);
      }

      const { loadImagesFromDirectory } = require('./downloader');
      const images = await loadImagesFromDirectory(options.outputDir!);

      if (images.length === 0) {
        console.error(`❌ No images found in ${options.outputDir}`);
        process.exit(1);
      }

      console.log(`Found ${images.length} images to analyze\n`);

      // Step 2: Analyze images
      console.log('Step 2: Analyzing images for valuable items...\n');
      const analysisResults = await analyzeImagesForValue(images, options.apiKey);

      // Step 3: Display results
      const formattedResults = formatAnalysisResults(analysisResults);
      console.log(formattedResults);

      // Save results
      const resultsPath = path.join(options.outputDir!, 'analysis-results.txt');
      fs.writeFileSync(resultsPath, formattedResults);
      console.log(`\n💾 Results saved to: ${resultsPath}\n`);

      const jsonPath = path.join(options.outputDir!, 'analysis-results.json');
      fs.writeFileSync(jsonPath, JSON.stringify({ analysis: analysisResults }, null, 2));
      console.log(`💾 JSON data saved to: ${jsonPath}\n`);
    }

    console.log('✅ Analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.log('\n💡 TIP: This website may use JavaScript to load images dynamically.');
      console.log('Try one of these alternatives:\n');
      console.log('1. Manually download images and use:');
      console.log('   yarn build && node dist/estate-scraper/analyze-local.js <image-folder>\n');
      console.log('2. See the manual extraction guide:');
      console.log('   src/estate-scraper/manual-guide.md\n');
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
