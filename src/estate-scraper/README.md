# Estate Sale Scraper & Analyzer

An automated tool that scrapes estate sale listings, downloads all images, and uses Claude Opus 4.5 AI to identify potentially valuable items.

## Features

- Scrapes estate sale listings from popular estate sale websites
- Downloads all images from the listing
- Uses Claude Opus 4.5 vision capabilities to analyze each image
- Identifies potentially valuable items including:
  - Antiques and vintage items
  - Designer furniture
  - Fine art and collectibles
  - Jewelry and watches
  - Sterling silver and fine china
  - Electronics and musical instruments
  - And much more
- Provides estimated value ranges and reasoning for each item
- Exports results in both human-readable and JSON formats

## Setup

### Prerequisites

1. Node.js and Yarn installed
2. An Anthropic API key (get one at https://console.anthropic.com/)

### Installation

```bash
# Install dependencies (already done if you're in this repo)
yarn install

# Build the project
yarn build
```

### Configuration

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

Or pass it via the `--api-key` flag when running the tool.

## Usage

### Basic Usage

```bash
yarn estate-scrape https://www.estatesales.net/CA/Yorba-Linda/92887/4773582
```

### Advanced Options

```bash
# Use custom output directory
yarn estate-scrape https://example.com/sale --output-dir ./my-images

# Analyze existing images without re-downloading
yarn estate-scrape --skip-download --output-dir ./my-images

# Pass API key directly
yarn estate-scrape https://example.com/sale --api-key sk-ant-...
```

### Command Line Options

- `<url>` - URL of the estate sale listing (required unless using --skip-download)
- `--output-dir <dir>` - Directory to save images (default: /tmp/estate-sale-images)
- `--skip-download` - Skip downloading, analyze existing images in output-dir
- `--api-key <key>` - Anthropic API key (or set ANTHROPIC_API_KEY env var)
- `--help, -h` - Show help message

## Output

The tool generates two output files in the output directory:

1. `analysis-results.txt` - Human-readable report with all findings
2. `analysis-results.json` - Structured JSON data for programmatic use

### Example Output

```
================================================================================
ESTATE SALE VALUATION ANALYSIS
================================================================================

IMAGE 1: /tmp/estate-sale-images/image-1.jpg
--------------------------------------------------------------------------------

POTENTIALLY VALUABLE ITEMS (3):

1. Mid-Century Modern Teak Credenza
   Estimated Value: $800-$1,500
   Reasoning: Clean lines and teak construction suggest quality Danish modern
   furniture from the 1960s. These pieces are highly sought after by collectors.

2. Sterling Silver Tea Service
   Estimated Value: $400-$800
   Reasoning: Appears to be a complete 4-piece set in good condition. Sterling
   silver is valuable both for craftsmanship and melt value.

3. Vintage Rolex Watch
   Estimated Value: $2,000-$8,000+
   Reasoning: If authentic, vintage Rolex watches maintain strong value,
   especially if in working condition with original band.
```

## How It Works

1. **Scraping**: The tool fetches the estate sale webpage and extracts all image URLs
2. **Downloading**: All images are downloaded to a local directory
3. **Analysis**: Each image is sent to Claude Opus 4.5 with specialized prompts
4. **Reporting**: Results are compiled into comprehensive reports

## Cost Considerations

This tool uses Claude Opus 4.5, which is Anthropic's most capable model. API costs are:

- ~$15 per million input tokens
- ~$75 per million output tokens

For a typical estate sale with 10-20 images, expect costs of $0.50-$2.00 per analysis.

## Tips for Best Results

1. **Timing**: Run the scraper as soon as a new estate sale is posted
2. **Multiple Listings**: Analyze multiple sales to find the best opportunities
3. **Follow Up**: Visit the sale in person to verify items and inspect condition
4. **Early Arrival**: Get there when doors open for best selection

## Troubleshooting

### No images found
Some estate sale websites may use JavaScript to load images. The scraper attempts multiple methods to find images, but some sites may require additional handling.

### API rate limits
The tool includes a 1-second delay between image analyses to avoid rate limits. For very large sales, this may take some time.

### Authentication errors
Make sure your ANTHROPIC_API_KEY is set correctly and is valid.

## License

MIT
