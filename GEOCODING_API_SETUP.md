# 🌍 Geocoding API Setup Guide

## 🎯 **Recommended Setup for Israeli Market**

### **Option 1: Google Maps API (Best for Production)**
- **Accuracy:** ⭐⭐⭐⭐⭐
- **Hebrew Support:** ⭐⭐⭐⭐⭐
- **Cost:** $5 per 1000 requests after free tier
- **Setup Time:** 10 minutes

### **Option 2: Nominatim (Best for Development/Testing)**
- **Accuracy:** ⭐⭐⭐⭐
- **Hebrew Support:** ⭐⭐⭐⭐
- **Cost:** Free
- **Setup Time:** 2 minutes

## 🔧 **Setup Instructions**

### **1. Google Maps API Setup**

#### Step 1: Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Geocoding API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

#### Step 2: Configure Environment
Add to your `.env` file:
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### Step 3: Test the API
```bash
# Test with curl
curl "https://maps.googleapis.com/maps/api/geocode/json?address=תל%20אביב&key=YOUR_API_KEY&region=il"
```

### **2. Nominatim Setup (Free)**

#### Step 1: No API Key Needed!
Nominatim is completely free and doesn't require an API key.

#### Step 2: Configure Environment
Add to your `.env` file:
```bash
# Nominatim is free, no key needed
GEOCODING_API=nominatim
```

#### Step 3: Test the API
```bash
# Test with curl
curl "https://nominatim.openstreetmap.org/search?q=תל%20אביב&countrycodes=il&format=json&limit=1"
```

### **3. Mapbox API Setup (Alternative)**

#### Step 1: Get Access Token
1. Go to [Mapbox](https://account.mapbox.com/)
2. Create an account
3. Go to "Access Tokens"
4. Create a new token with geocoding permissions
5. Copy your access token

#### Step 2: Configure Environment
Add to your `.env` file:
```bash
MAPBOX_API_KEY=your_access_token_here
```

### **4. OpenCage API Setup (Privacy-Friendly)**

#### Step 1: Get API Key
1. Go to [OpenCage](https://opencagedata.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Copy your API key

#### Step 2: Configure Environment
Add to your `.env` file:
```bash
OPENCAGE_API_KEY=your_api_key_here
```

## 🚀 **Implementation in Your App**

### **Update Your Controllers**

Replace the existing geocoding functions in your controllers with the new utility:

```javascript
// In your controllers, replace the existing geocodeAddress function with:
import { geocodeAddress } from '../utils/geocoding.js';

// Then use it like this:
const coordinates = await geocodeAddress(locationInput, latitude, longitude, 'nominatim');
```

### **Environment Variables**

Create a `.env` file in your server directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/shelter_surfing"

# JWT
JWT_SECRET="your_jwt_secret_here"

# Geocoding APIs (choose one or more)
GOOGLE_MAPS_API_KEY="your_google_api_key"
MAPBOX_API_KEY="your_mapbox_token"
OPENCAGE_API_KEY="your_opencage_key"

# Preferred geocoding API
GEOCODING_API="nominatim"
```

## 📊 **API Comparison**

| API | Free Tier | Hebrew Support | Israeli Coverage | Accuracy | Setup |
|-----|-----------|----------------|------------------|----------|-------|
| **Google Maps** | 200 req/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium |
| **Nominatim** | Unlimited | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Easy |
| **Mapbox** | 100k req/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| **OpenCage** | 2.5k req/day | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Easy |

## 🧪 **Testing Your Setup**

### **Test Script**

Create a test file to verify your geocoding setup:

```javascript
// test-geocoding.js
import { geocodeAddress } from './utils/geocoding.js';

async function testGeocoding() {
  const testAddresses = [
    'תל אביב',
    'Jerusalem',
    'חיפה',
    'Rishon LeZion'
  ];

  for (const address of testAddresses) {
    try {
      const result = await geocodeAddress(address);
      console.log(`${address}: ${result.lat}, ${result.lng} (${result.source})`);
    } catch (error) {
      console.error(`Failed to geocode ${address}:`, error.message);
    }
  }
}

testGeocoding();
```

### **Run the Test**
```bash
cd server
node test-geocoding.js
```

## 💰 **Cost Optimization**

### **For Development/Testing**
- Use **Nominatim** (completely free)
- No API keys needed
- Good enough for testing

### **For Production**
- Start with **Google Maps API**
- Monitor usage in Google Cloud Console
- Set up billing alerts
- Consider caching results

### **Hybrid Approach**
- Use Nominatim for development
- Use Google Maps for production
- Implement caching to reduce API calls

## 🔒 **Security Best Practices**

### **API Key Security**
1. **Never commit API keys** to version control
2. Use environment variables
3. Restrict API keys to specific domains/IPs
4. Monitor API usage for unusual activity

### **Rate Limiting**
- Nominatim: 1 request per second
- Google Maps: 50 requests per second
- Mapbox: 600 requests per minute
- OpenCage: 2500 requests per day

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. "API key not configured"**
```bash
# Check your .env file
cat .env | grep API_KEY

# Verify environment variables are loaded
console.log(process.env.GOOGLE_MAPS_API_KEY);
```

#### **2. "No results found"**
- Check if the address is valid
- Try with different spelling
- Verify the API supports Hebrew text

#### **3. "Rate limit exceeded"**
- Add delays between requests
- Implement caching
- Use multiple API keys

#### **4. "CORS errors"**
- Geocoding should be done server-side
- Don't call APIs directly from frontend

## 📈 **Performance Tips**

### **Caching**
```javascript
// Simple in-memory cache
const geocodeCache = new Map();

const geocodeWithCache = async (address) => {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }
  
  const result = await geocodeAddress(address);
  geocodeCache.set(address, result);
  return result;
};
```

### **Batch Processing**
```javascript
// Process multiple addresses efficiently
const geocodeBatch = async (addresses) => {
  const results = [];
  for (const address of addresses) {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await geocodeAddress(address);
    results.push(result);
  }
  return results;
};
```

## 🎯 **Recommended Setup for Your App**

### **Development Phase**
```bash
# Use Nominatim (free, no setup required)
GEOCODING_API=nominatim
```

### **Production Phase**
```bash
# Use Google Maps for best accuracy
GOOGLE_MAPS_API_KEY=your_google_api_key
GEOCODING_API=google
```

### **Fallback Strategy**
The geocoding utility automatically falls back:
1. GPS coordinates (if available)
2. Preferred API
3. Nominatim
4. Israeli cities database
5. Default to Tel Aviv

This ensures your app always works, even if APIs are down or rate-limited.

---

**Next Steps:**
1. Choose your preferred API
2. Set up the environment variables
3. Test with the provided script
4. Update your controllers to use the new utility
5. Deploy and monitor usage 