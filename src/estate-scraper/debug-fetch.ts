import axios from 'axios';

async function debugFetch() {
  const url = 'https://www.estatesales.net/CA/Redondo-Beach/90278/4774413';

  try {
    console.log('Fetching:', url);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 5,
      validateStatus: () => true // Accept any status
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', response.headers);
    console.log('Data length:', response.data.length);
    console.log('First 500 chars:', response.data.substring(0, 500));
  } catch (error) {
    console.error('Error:', error);
  }
}

debugFetch();
