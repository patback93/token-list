import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EstateSaleListing {
  url: string;
  title: string;
  dates: string;
  location: string;
  description: string;
  imageUrls: string[];
}

export async function scrapeEstateSale(url: string): Promise<EstateSaleListing> {
  try {
    console.log(`Fetching estate sale listing from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      maxRedirects: 5,
      timeout: 30000
    });

    const $ = cheerio.load(response.data);

    // Extract sale title
    const title = $('h1').first().text().trim() ||
                  $('.sale-title').text().trim() ||
                  $('title').text().trim();

    // Extract dates
    const dates = $('.sale-dates').text().trim() ||
                  $('.dates').text().trim() ||
                  'Dates not found';

    // Extract location
    const location = $('.sale-address').text().trim() ||
                     $('.address').text().trim() ||
                     'Location not found';

    // Extract description
    const description = $('.sale-description').text().trim() ||
                        $('.description').text().trim() ||
                        $('meta[name="description"]').attr('content') ||
                        '';

    // Extract image URLs from multiple possible sources
    const imageUrls: string[] = [];

    // Method 1: Look for gallery images
    $('img').each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        // Convert relative URLs to absolute
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href;
        if (!imageUrls.includes(absoluteUrl)) {
          imageUrls.push(absoluteUrl);
        }
      }
    });

    // Method 2: Look for background images in style attributes
    $('[style*="background-image"]').each((_, elem) => {
      const style = $(elem).attr('style') || '';
      const match = style.match(/url\(['"]?([^'"()]+)['"]?\)/);
      if (match && match[1]) {
        const absoluteUrl = match[1].startsWith('http') ? match[1] : new URL(match[1], url).href;
        if (!imageUrls.includes(absoluteUrl)) {
          imageUrls.push(absoluteUrl);
        }
      }
    });

    // Method 3: Look for data attributes that might contain image URLs
    $('[data-image], [data-img], [data-photo]').each((_, elem) => {
      const dataImage = $(elem).attr('data-image') ||
                       $(elem).attr('data-img') ||
                       $(elem).attr('data-photo');
      if (dataImage) {
        const absoluteUrl = dataImage.startsWith('http') ? dataImage : new URL(dataImage, url).href;
        if (!imageUrls.includes(absoluteUrl)) {
          imageUrls.push(absoluteUrl);
        }
      }
    });

    // Method 4: Look for anchor tags with image links
    $('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".webp"]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).href;
        if (!imageUrls.includes(absoluteUrl)) {
          imageUrls.push(absoluteUrl);
        }
      }
    });

    console.log(`Found ${imageUrls.length} images`);

    return {
      url,
      title,
      dates,
      location,
      description,
      imageUrls: imageUrls.filter(url =>
        url.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)
      )
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch estate sale: ${error.message}`);
    }
    throw error;
  }
}
