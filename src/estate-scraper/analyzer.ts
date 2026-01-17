import Anthropic from '@anthropic-ai/sdk';
import { DownloadedImage } from './downloader';

export interface ValuableItem {
  description: string;
  estimatedValue: string;
  reasoning: string;
}

export interface AnalysisResult {
  imageNumber: number;
  imagePath: string;
  valuableItems: ValuableItem[];
  generalObservations: string;
}

export async function analyzeImagesForValue(
  images: DownloadedImage[],
  apiKey?: string
): Promise<AnalysisResult[]> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required. ' +
      'Set it with: export ANTHROPIC_API_KEY=your-key-here'
    );
  }

  const anthropic = new Anthropic({
    apiKey: key,
  });

  const results: AnalysisResult[] = [];

  console.log(`\nAnalyzing ${images.length} images with Claude Opus 4.5...\n`);

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`Analyzing image ${i + 1}/${images.length}...`);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: image.base64,
                },
              },
              {
                type: 'text',
                text: `You are an expert estate sale appraiser and antiques specialist. Analyze this image from an estate sale and identify any items that could potentially be valuable.

For each potentially valuable item, provide:
1. A clear description of the item
2. An estimated value range (be realistic but optimistic for quality pieces)
3. The reasoning for why it might be valuable (brand, age, rarity, condition, style, materials, etc.)

Focus on:
- Antiques and vintage items
- Designer or high-end furniture
- Fine art and prints
- Collectibles (coins, stamps, toys, etc.)
- Jewelry and watches
- Sterling silver, crystal, fine china
- Electronics (vintage audio equipment, etc.)
- Books (first editions, signed copies)
- Designer clothing and accessories
- Musical instruments
- Tools (vintage, specialty, or professional grade)
- Any other items of notable value

Format your response as JSON with the following structure:
{
  "valuableItems": [
    {
      "description": "Item description",
      "estimatedValue": "Value range (e.g., $50-$150, $500+, etc.)",
      "reasoning": "Why this item could be valuable"
    }
  ],
  "generalObservations": "Overall observations about the image and general condition/quality"
}

If there are no obviously valuable items in the image, return an empty valuableItems array but still provide general observations.`
              }
            ],
          },
        ],
      });

      // Extract the JSON response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Try to parse JSON from response
      let parsedResponse: { valuableItems: ValuableItem[], generalObservations: string };

      try {
        // Look for JSON in code blocks or raw text
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                         responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                         [null, responseText];

        parsedResponse = JSON.parse(jsonMatch[1] || responseText);
      } catch (parseError) {
        // If parsing fails, create a structured response from the text
        parsedResponse = {
          valuableItems: [],
          generalObservations: responseText
        };
      }

      results.push({
        imageNumber: i + 1,
        imagePath: image.localPath,
        valuableItems: parsedResponse.valuableItems || [],
        generalObservations: parsedResponse.generalObservations || responseText
      });

      console.log(`✓ Analysis complete for image ${i + 1}`);

      if (parsedResponse.valuableItems && parsedResponse.valuableItems.length > 0) {
        console.log(`  Found ${parsedResponse.valuableItems.length} potentially valuable item(s)`);
      }

    } catch (error) {
      console.error(`✗ Failed to analyze image ${i + 1}:`, error);
      results.push({
        imageNumber: i + 1,
        imagePath: image.localPath,
        valuableItems: [],
        generalObservations: `Error analyzing image: ${error}`
      });
    }

    // Add a small delay to avoid rate limits
    if (i < images.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export function formatAnalysisResults(results: AnalysisResult[]): string {
  let output = '\n';
  output += '='.repeat(80) + '\n';
  output += 'ESTATE SALE VALUATION ANALYSIS\n';
  output += '='.repeat(80) + '\n\n';

  const allValuableItems: Array<ValuableItem & { imageNumber: number }> = [];

  for (const result of results) {
    output += `\nIMAGE ${result.imageNumber}: ${result.imagePath}\n`;
    output += '-'.repeat(80) + '\n';

    if (result.valuableItems.length > 0) {
      output += `\nPOTENTIALLY VALUABLE ITEMS (${result.valuableItems.length}):\n\n`;

      result.valuableItems.forEach((item, idx) => {
        output += `${idx + 1}. ${item.description}\n`;
        output += `   Estimated Value: ${item.estimatedValue}\n`;
        output += `   Reasoning: ${item.reasoning}\n\n`;

        allValuableItems.push({ ...item, imageNumber: result.imageNumber });
      });
    } else {
      output += '\nNo obviously valuable items identified in this image.\n\n';
    }

    if (result.generalObservations) {
      output += `General Observations:\n${result.generalObservations}\n`;
    }

    output += '\n';
  }

  // Summary section
  output += '\n' + '='.repeat(80) + '\n';
  output += 'SUMMARY\n';
  output += '='.repeat(80) + '\n\n';
  output += `Total Images Analyzed: ${results.length}\n`;
  output += `Total Potentially Valuable Items Found: ${allValuableItems.length}\n\n`;

  if (allValuableItems.length > 0) {
    output += 'TOP ITEMS TO LOOK FOR:\n\n';
    allValuableItems.forEach((item, idx) => {
      output += `${idx + 1}. ${item.description} (Image ${item.imageNumber})\n`;
      output += `   Value: ${item.estimatedValue}\n\n`;
    });
  }

  return output;
}
