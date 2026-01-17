# Manual Image Extraction Guide

## For JavaScript-Heavy Sites (like estatesales.net)

Some estate sale websites use JavaScript to load images dynamically, making them difficult to scrape automatically. Here's how to manually extract images and analyze them.

### Method 1: Browser DevTools (Recommended)

1. **Open the estate sale listing** in your browser
2. **Open DevTools** (Press F12 or right-click > Inspect)
3. **Go to the Network tab**
4. **Filter by "Img"** to show only image requests
5. **Scroll through the entire listing** to load all images
6. **Right-click in the Network tab** > "Save all as HAR with content"
7. **Use the HAR extractor** (we'll create a tool for this)

### Method 2: Browser Extension

1. Install an image downloader extension like:
   - "Download All Images" (Chrome/Edge)
   - "Image Downloader" (Firefox)
2. Visit the estate sale listing
3. Scroll through to load all images
4. Click the extension icon
5. Select all estate sale images
6. Download to a folder
7. Run: `yarn estate-scrape --skip-download --output-dir /path/to/images`

### Method 3: Manual Screenshot & Save

1. Visit the estate sale listing
2. **Right-click each image** > "Save image as..."
3. Save all images to a folder
4. Run: `yarn estate-scrape --skip-download --output-dir /path/to/images`

### Method 4: Developer Tools Console

For estatesales.net specifically:

1. Open the listing page
2. Open Console (F12 > Console tab)
3. Paste this JavaScript:

```javascript
// Extract all image URLs from the page
const images = [];
document.querySelectorAll('img').forEach(img => {
  if (img.src && img.src.includes('picturescdn')) {
    images.push(img.src);
  }
});

// Also check for lazy-loaded images
document.querySelectorAll('[style*="background-image"]').forEach(el => {
  const match = el.style.backgroundImage.match(/url\(['"]?([^'"()]+)['"]?\)/);
  if (match && match[1]) {
    images.push(match[1]);
  }
});

// Download all images
console.log(`Found ${images.length} images`);
console.log(JSON.stringify(images, null, 2));

// Copy to clipboard
copy(images);
console.log('Image URLs copied to clipboard!');
```

4. Save the JSON array to a file: `image-urls.json`
5. Use our downloader:

```bash
# Create a download script
node -e "
const urls = require('./image-urls.json');
const fs = require('fs');
const path = require('path');
const https = require('https');

urls.forEach((url, i) => {
  https.get(url, (res) => {
    const ext = url.match(/\\.([a-z]+)(\\?|$)/i)?.[1] || 'jpg';
    const dest = path.join('./estate-images', \`image-\${i+1}.\${ext}\`);
    res.pipe(fs.createWriteStream(dest));
  });
});
"
```

## Then Analyze

Once you have the images in a folder:

```bash
yarn estate-scrape --skip-download --output-dir ./estate-images
```

## Estate Sales Network Specific

For estatesales.net, the images are hosted at:
- `https://picturescdn.estatesales.net/...`

You can often construct the URLs if you know the sale ID:
- Format: `https://picturescdn.estatesales.net/[CompanyID]/[SaleID]/[ImageNumber].jpg`

## Future Enhancement

We're working on adding Puppeteer support for automatic JavaScript rendering, but for now, manual extraction is the most reliable method.
