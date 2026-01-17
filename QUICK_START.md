# Estate Sale Analyzer - Quick Start

## The Problem with EstateSales.net

**Important:** EstateSales.net (and many modern estate sale websites) use JavaScript to load images dynamically. This means our automated scraper cannot extract images directly.

## Solution: Manual Download + AI Analysis

Here's the workflow that works:

### Step 1: Download Images Manually

**Option A: Browser Extension (Easiest)**

1. Install "Download All Images" extension for your browser
2. Visit the estate sale listing
3. Scroll through the entire page to load all images
4. Click the extension icon → Download all images to a folder

**Option B: DevTools Console**

1. Visit https://www.estatesales.net/CA/Yorba-Linda/92887/4773582
2. Press F12 to open DevTools → Console tab
3. Paste this code:

```javascript
// Get all image URLs
const images = Array.from(document.querySelectorAll('img'))
  .map(img => img.src)
  .filter(src => src && src.includes('picturescdn'))
  .filter((v, i, a) => a.indexOf(v) === i); // unique only

console.log(`Found ${images.length} images`);

// Download them
images.forEach((url, i) => {
  fetch(url)
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `estate-image-${i+1}.jpg`;
      a.click();
    });
});
```

4. Images will start downloading automatically

**Option C: Right-Click Save Each Image**

1. Visit the estate sale listing
2. Right-click each image → "Save image as..."
3. Save all to a folder (e.g., `~/Downloads/yorba-linda-estate`)

### Step 2: Analyze with Claude Opus 4.5

Once you have images in a folder:

```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key-here

# Build the project
yarn build

# Analyze the images
node dist/estate-scraper/analyze-local.js /path/to/your/images

# For example:
node dist/estate-scraper/analyze-local.js ~/Downloads/yorba-linda-estate
```

### Step 3: Review Results

The AI will create two files in your image directory:

- `analysis-results.txt` - Human-readable report
- `analysis-results.json` - Structured data

## What the AI Finds

Claude Opus 4.5 will identify valuable items like:

- 🪑 Mid-century modern furniture (Eames, Herman Miller, etc.)
- 🎨 Fine art and original paintings
- 💍 Jewelry (gold, silver, precious stones)
- 🍽️ Sterling silver flatware and serving pieces
- 🏺 Antiques and collectibles
- 📚 Rare books and first editions
- 🎸 Vintage musical instruments
- 📷 Collectible cameras and electronics
- 🎭 Designer clothing and accessories
- 🔧 Professional or vintage tools

For each item, you get:
- **Clear description** of what it is
- **Estimated value range** (e.g., "$500-$1,200")
- **Reasoning** why it's valuable (brand, age, rarity, materials)

## Example Output

```
IMAGE 1: /path/to/image-1.jpg
────────────────────────────────────────

POTENTIALLY VALUABLE ITEMS (2):

1. Herman Miller Eames Lounge Chair
   Estimated Value: $3,000-$6,000
   Reasoning: Authentic mid-century modern classic with rosewood shell
   and leather upholstery. The style and construction suggest this is
   an original or authorized reproduction, which maintains strong value.

2. Tiffany & Co. Sterling Silver Tea Set
   Estimated Value: $1,500-$3,000
   Reasoning: Complete 5-piece set with visible Tiffany hallmarks.
   Sterling silver has both collectible and melt value. Tiffany pieces
   command a premium in the market.

General Observations: This image shows a well-maintained mid-century
modern living room with several quality pieces. The furniture appears
to be in good condition with minimal wear.
```

## Cost

- Claude Opus 4.5: ~$15/1M input tokens, ~$75/1M output tokens
- Typical estate sale (10-20 images): **$0.50-$2.00 total**
- Very affordable given potential finds!

## Tips for Success

1. **Download ALL images** from the listing - more data = better analysis
2. **Include close-ups** of markings, signatures, and labels when available
3. **Arrive early** to the sale with your analysis in hand
4. **Bring cash** - many estate sales prefer it
5. **Verify in person** - AI analysis is a starting point, not gospel
6. **Check authenticity** - watch for reproductions and fakes

## Why This Works

While we can't automatically scrape JavaScript-heavy sites, the **real value** of this tool is the AI analysis. Claude Opus 4.5 is an expert appraiser that can:

- Recognize thousands of brands and makers
- Identify styles and periods (Art Deco, Mid-Century, Victorian, etc.)
- Spot valuable materials (sterling, gold, crystal, etc.)
- Estimate market values based on condition and rarity

The manual download step takes 2-3 minutes, but saves you hours of research and potentially helps you find thousands of dollars in underpriced items!

## Next Steps

1. **Download images** from the Yorba Linda sale
2. **Set your API key**: `export ANTHROPIC_API_KEY=your-key`
3. **Run analysis**: `node dist/estate-scraper/analyze-local.js <folder>`
4. **Review results** and plan your visit
5. **Get there early** and make some great finds!

## Future Enhancements

We're working on:
- Puppeteer integration for automatic JavaScript rendering
- Batch processing multiple sales
- Price tracking and market trend analysis
- Mobile app for on-site analysis

For now, the manual approach works great and the AI analysis is incredibly valuable!
