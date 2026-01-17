import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export interface DownloadedImage {
  url: string;
  localPath: string;
  base64: string;
  mimeType: string;
}

export async function downloadImages(
  imageUrls: string[],
  outputDir: string = '/tmp/estate-sale-images'
): Promise<DownloadedImage[]> {
  // Create output directory if it doesn't exist
  try {
    await mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const downloadedImages: DownloadedImage[] = [];

  console.log(`Downloading ${imageUrls.length} images to ${outputDir}...`);

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    try {
      console.log(`Downloading image ${i + 1}/${imageUrls.length}: ${imageUrl}`);

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000 // 30 second timeout
      });

      // Determine file extension from URL or content-type
      let extension = 'jpg';
      const urlMatch = imageUrl.match(/\.([a-z0-9]+)(\?.*)?$/i);
      if (urlMatch) {
        extension = urlMatch[1].toLowerCase();
      } else if (response.headers['content-type']) {
        const contentType = response.headers['content-type'];
        if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('webp')) extension = 'webp';
        else if (contentType.includes('gif')) extension = 'gif';
      }

      // Determine MIME type
      let mimeType = 'image/jpeg';
      if (extension === 'png') mimeType = 'image/png';
      else if (extension === 'webp') mimeType = 'image/webp';
      else if (extension === 'gif') mimeType = 'image/gif';

      const filename = `image-${i + 1}.${extension}`;
      const localPath = path.join(outputDir, filename);

      await writeFile(localPath, response.data);

      // Convert to base64 for Claude API
      const base64 = Buffer.from(response.data).toString('base64');

      downloadedImages.push({
        url: imageUrl,
        localPath,
        base64,
        mimeType
      });

      console.log(`✓ Downloaded: ${filename}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Failed to download ${imageUrl}: ${error.message}`);
      } else {
        console.error(`✗ Failed to download ${imageUrl}:`, error);
      }
      // Continue with next image
    }
  }

  console.log(`Successfully downloaded ${downloadedImages.length}/${imageUrls.length} images`);

  return downloadedImages;
}

export async function loadImagesFromDirectory(directory: string): Promise<DownloadedImage[]> {
  const files = fs.readdirSync(directory);
  const downloadedImages: DownloadedImage[] = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
      const buffer = await readFile(filePath);
      const base64 = buffer.toString('base64');

      let mimeType = 'image/jpeg';
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.gif') mimeType = 'image/gif';

      downloadedImages.push({
        url: filePath,
        localPath: filePath,
        base64,
        mimeType
      });
    }
  }

  return downloadedImages;
}
