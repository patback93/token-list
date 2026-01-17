# Estate Sale Scraper & Valuation Tool

## Overview

This tool automates the process of finding valuable items at estate sales by:
1. Scraping estate sale listing websites to extract all images
2. Downloading the images locally
3. Using Claude Opus 4.5's vision capabilities to analyze each image
4. Identifying potentially valuable items with estimated values and reasoning

## How It Works

### Architecture

The tool consists of four main modules:

1. **Scraper (`src/estate-scraper/scraper.ts`)**: Fetches estate sale webpages and extracts image URLs using multiple detection methods
2. **Downloader (`src/estate-scraper/downloader.ts`)**: Downloads images and converts them to base64 for AI analysis
3. **Analyzer (`src/estate-scraper/analyzer.ts`)**: Sends images to Claude Opus 4.5 for expert valuation analysis
4. **CLI (`src/estate-scraper/cli.ts`)**: Command-line interface that orchestrates the entire workflow

### What Claude Opus 4.5 Looks For

The AI is prompted to identify valuable items including:
- Antiques and vintage items (furniture, decor, etc.)
- Designer or high-end furniture (mid-century modern, etc.)
- Fine art, paintings, and prints
- Collectibles (coins, stamps, toys, sports memorabilia)
- Jewelry and watches (especially precious metals and designer pieces)
- Sterling silver, fine crystal, and china
- Vintage electronics (audio equipment, cameras, etc.)
- First edition books and signed copies
- Designer clothing and accessories
- Musical instruments
- Professional-grade or vintage tools

For each item, the AI provides:
- **Description**: Clear identification of the item
- **Estimated Value**: Realistic price range
- **Reasoning**: Why it's valuable (brand, age, rarity, condition, materials, etc.)

## Setup

### Prerequisites

1. Node.js and Yarn
2. Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Set your API key
export ANTHROPIC_API_KEY=your-api-key-here
```

## Usage

### Basic Command

```bash
yarn estate-scrape <estate-sale-url>
```

### Options

```bash
--output-dir <dir>     # Custom directory for images (default: /tmp/estate-sale-images)
--skip-download        # Analyze existing images without re-downloading
--api-key <key>        # Pass API key directly instead of using env var
--help                 # Show help message
```

### Examples

```bash
# Analyze an estate sale
yarn estate-scrape https://www.estatesales.net/CA/Los-Angeles/90210/1234567

# Use custom output directory
yarn estate-scrape https://example.com/sale --output-dir ./estate-images

# Re-analyze existing images
yarn estate-scrape --skip-download --output-dir ./estate-images

# Pass API key directly
yarn estate-scrape https://example.com/sale --api-key sk-ant-...
```

## Output

The tool generates two files in the output directory:

### 1. analysis-results.txt

Human-readable report with all findings:

```
================================================================================
ESTATE SALE VALUATION ANALYSIS
================================================================================

IMAGE 1: /tmp/estate-sale-images/image-1.jpg
--------------------------------------------------------------------------------

POTENTIALLY VALUABLE ITEMS (2):

1. Eames Lounge Chair and Ottoman
   Estimated Value: $3,000-$6,000
   Reasoning: Iconic mid-century modern design by Herman Miller. The rosewood
   shell and leather upholstery appear to be in good condition. Authentic
   Eames chairs hold their value extremely well.

2. Tiffany & Co. Sterling Silver Tea Set
   Estimated Value: $1,500-$3,000
   Reasoning: Appears to be a 5-piece set with the distinctive Tiffany hallmark
   visible. Sterling silver has intrinsic value, plus the Tiffany brand commands
   a premium.

...
```

### 2. analysis-results.json

Structured data for programmatic use:

```json
{
  "listing": {
    "url": "https://...",
    "title": "Estate Sale Title",
    "dates": "Jan 15-16, 2026",
    "location": "123 Main St, City, ST",
    "imageUrls": [...]
  },
  "analysis": [
    {
      "imageNumber": 1,
      "imagePath": "/tmp/estate-sale-images/image-1.jpg",
      "valuableItems": [
        {
          "description": "Eames Lounge Chair and Ottoman",
          "estimatedValue": "$3,000-$6,000",
          "reasoning": "..."
        }
      ],
      "generalObservations": "..."
    }
  ]
}
```

## Cost Considerations

- Model: Claude Opus 4.5 (~$15 per 1M input tokens, ~$75 per 1M output tokens)
- Typical estate sale (10-20 images): **$0.50-$2.00 per analysis**
- The AI analysis is very cost-effective compared to the potential value of items found

## Tips for Best Results

1. **Act Fast**: Run the scraper as soon as new estate sales are posted
2. **Analyze Multiple Sales**: Check several listings to find the best opportunities
3. **Visit in Person**: Always verify items and inspect condition before purchasing
4. **Arrive Early**: Get to the sale when doors open for first pick
5. **Bring Cash**: Many estate sales prefer or only accept cash
6. **Research Further**: Use the AI analysis as a starting point, then research specific items
7. **Check Authenticity**: Be wary of reproductions and fakes, especially for high-value items

## Website Compatibility

The scraper works best with sites that serve static HTML. Some estate sale websites use heavy JavaScript for image loading, which may require additional handling.

Currently tested with:
- estatesales.net (requires proper headers)
- Other estate sale websites with static image galleries

## Troubleshooting

### "No images found"
- The website may load images via JavaScript (not supported by cheerio)
- Try saving the page manually and using `--skip-download` mode
- Check if the URL is correct and the listing is still active

### "ANTHROPIC_API_KEY is required"
```bash
export ANTHROPIC_API_KEY=your-key-here
```

### "Request failed with status code 404"
- The listing may have been removed
- Check if the URL is accessible in a browser
- Some websites have bot protection

### Rate limits
- The tool includes 1-second delays between API calls
- For very large sales (50+ images), the analysis may take some time

## Advanced Usage

### Analyzing Local Images

If you have estate sale photos saved locally:

```bash
# Put images in a directory
mkdir my-estate-images
cp ~/Downloads/estate-photo-*.jpg my-estate-images/

# Run analysis only
yarn estate-scrape --skip-download --output-dir my-estate-images
```

### Batch Processing

Create a script to analyze multiple sales:

```bash
#!/bin/bash
for url in \
  "https://www.estatesales.net/CA/City1/12345/1234567" \
  "https://www.estatesales.net/CA/City2/67890/7654321"
do
  echo "Analyzing: $url"
  yarn estate-scrape "$url" --output-dir "./sale-$(date +%s)"
done
```

## Integration Ideas

This tool can be integrated into larger workflows:

1. **Automated Monitoring**: Set up a cron job to scrape new listings daily
2. **Price Tracking**: Build a database of estimated values over time
3. **Alert System**: Send notifications when high-value items are found
4. **Market Analysis**: Analyze trends in estate sale inventories
5. **Dealer Tools**: Help resellers identify profitable inventory

## Privacy & Ethics

- Respect robots.txt and website terms of service
- Don't overload servers with too many requests
- Use the tool responsibly and ethically
- The AI analysis is for informational purposes only

## License

MIT
