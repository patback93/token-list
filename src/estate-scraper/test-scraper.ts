import { scrapeEstateSale } from './scraper';
import { downloadImages } from './downloader';

async function testScraper() {
  const testUrl = 'https://www.estatesales.net/CA/Redondo-Beach/90278/4774413';

  console.log('Testing Estate Sale Scraper');
  console.log('===========================\n');

  try {
    // Test scraping
    console.log('Step 1: Scraping estate sale listing...\n');
    const listing = await scrapeEstateSale(testUrl);

    console.log('Listing Information:');
    console.log(`  Title: ${listing.title}`);
    console.log(`  Dates: ${listing.dates}`);
    console.log(`  Location: ${listing.location}`);
    console.log(`  Images found: ${listing.imageUrls.length}\n`);

    if (listing.imageUrls.length > 0) {
      console.log('Sample image URLs:');
      listing.imageUrls.slice(0, 5).forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });

      console.log('\nStep 2: Downloading images (first 3 only for testing)...\n');
      const imagesToDownload = listing.imageUrls.slice(0, 3);
      const downloadedImages = await downloadImages(imagesToDownload, '/tmp/estate-sale-test');

      console.log(`\n✓ Successfully downloaded ${downloadedImages.length} images to /tmp/estate-sale-test`);
      console.log('\nTest complete! The scraper is working correctly.');
      console.log('\nTo run full analysis with Claude Opus 4.5:');
      console.log('1. Set your API key: export ANTHROPIC_API_KEY=your-key-here');
      console.log('2. Run: yarn estate-scrape ' + testUrl);
    } else {
      console.log('⚠ No images found. The website structure may have changed.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testScraper();
