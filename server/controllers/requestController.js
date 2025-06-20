import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Enhanced geocoding function for Israeli locations (same as shelter controller)
const geocodeAddress = async (address, latitude = null, longitude = null) => {
  // If GPS coordinates are provided, use them
  if (latitude !== null && longitude !== null) {
    console.log(`Using GPS coordinates: ${latitude}, ${longitude}`);
    return { lat: parseFloat(latitude), lng: parseFloat(longitude) };
  }

  // Israeli cities coordinates
  const israeliCities = {
    'תל אביב': { lat: 32.0853, lng: 34.7818 },
    'tel aviv': { lat: 32.0853, lng: 34.7818 },
    'jerusalem': { lat: 31.7683, lng: 35.2137 },
    'ירושלים': { lat: 31.7683, lng: 35.2137 },
    'haifa': { lat: 32.7940, lng: 34.9896 },
    'חיפה': { lat: 32.7940, lng: 34.9896 },
    'rishon lezion': { lat: 31.9608, lng: 34.8013 },
    'ראשון לציון': { lat: 31.9608, lng: 34.8013 },
    'petah tikva': { lat: 32.0840, lng: 34.8878 },
    'פתח תקווה': { lat: 32.0840, lng: 34.8878 },
    'ashdod': { lat: 31.8044, lng: 34.6503 },
    'אשדוד': { lat: 31.8044, lng: 34.6503 },
    'netanya': { lat: 32.3328, lng: 34.8600 },
    'נתניה': { lat: 32.3328, lng: 34.8600 },
    'beer sheva': { lat: 31.2518, lng: 34.7913 },
    'באר שבע': { lat: 31.2518, lng: 34.7913 },
    'holon': { lat: 32.0167, lng: 34.7792 },
    'חולון': { lat: 32.0167, lng: 34.7792 },
    'bnei brak': { lat: 32.0807, lng: 34.8338 },
    'בני ברק': { lat: 32.0807, lng: 34.8338 },
    'ramat gan': { lat: 32.0684, lng: 34.8248 },
    'רמת גן': { lat: 32.0684, lng: 34.8248 },
    'bat yam': { lat: 32.0231, lng: 34.7503 },
    'בת ים': { lat: 32.0231, lng: 34.7503 },
    'herzliya': { lat: 32.1664, lng: 34.8433 },
    'הרצליה': { lat: 32.1664, lng: 34.8433 },
    'kfar saba': { lat: 32.1750, lng: 34.9070 },
    'כפר סבא': { lat: 32.1750, lng: 34.9070 },
    'ra\'anana': { lat: 32.1833, lng: 34.8667 },
    'רעננה': { lat: 32.1833, lng: 34.8667 },
    'givatayim': { lat: 32.0723, lng: 34.8125 },
    'גבעתיים': { lat: 32.0723, lng: 34.8125 },
    'kiryat ono': { lat: 32.0633, lng: 34.8550 },
    'קריית אונו': { lat: 32.0633, lng: 34.8550 },
    'ramat hasharon': { lat: 32.1450, lng: 34.8417 },
    'רמת השרון': { lat: 32.1450, lng: 34.8417 },
    'hod hasharon': { lat: 32.1500, lng: 34.8833 },
    'הוד השרון': { lat: 32.1500, lng: 34.8833 },
    'givat shmuel': { lat: 32.0783, lng: 34.8483 },
    'גבעת שמואל': { lat: 32.0783, lng: 34.8483 },
    'yehud': { lat: 32.0333, lng: 34.8833 },
    'יהוד': { lat: 32.0333, lng: 34.8833 },
    'or yehuda': { lat: 32.0333, lng: 34.8500 },
    'אור יהודה': { lat: 32.0333, lng: 34.8500 },
    'ashkelon': { lat: 31.6688, lng: 34.5717 },
    'אשקלון': { lat: 31.6688, lng: 34.5717 },
    'kiryat gat': { lat: 31.6100, lng: 34.7642 },
    'קריית גת': { lat: 31.6100, lng: 34.7642 },
    'dimona': { lat: 31.0667, lng: 35.0333 },
    'דימונה': { lat: 31.0667, lng: 35.0333 },
    'arad': { lat: 31.2589, lng: 35.2128 },
    'ערד': { lat: 31.2589, lng: 35.2128 }
  };

  const normalizedAddress = address.toLowerCase();
  
  // Try to find a match in Israeli cities
  for (const [city, coords] of Object.entries(israeliCities)) {
    // Check for exact match first
    if (normalizedAddress === city) {
      console.log(`Found exact Israeli city match: ${city}`);
      return coords;
    }
    
    // Check if the address contains the city name
    if (normalizedAddress.includes(city)) {
      console.log(`Found Israeli city in address: ${city}`);
      return coords;
    }
    
    // For Hebrew addresses, try to match without vowel points and special characters
    const cleanAddress = normalizedAddress.replace(/[\u0591-\u05C7]/g, '');
    const cleanCity = city.replace(/[\u0591-\u05C7]/g, '');
    if (cleanAddress.includes(cleanCity)) {
      console.log(`Found Israeli city match after cleaning: ${city}`);
      return coords;
    }
  }

  // If no match found, try to extract city name from district format
  const districtMatch = normalizedAddress.match(/(נפת|מחוז)\s+([^,]+)/);
  if (districtMatch) {
    const districtCity = districtMatch[2];
    console.log(`Trying to match district city: ${districtCity}`);
    
    for (const [city, coords] of Object.entries(israeliCities)) {
      if (districtCity.includes(city.toLowerCase())) {
        console.log(`Found city match from district: ${city}`);
        return coords;
      }
    }
  }

  // If no match found, return default coordinates (Tel Aviv)
  console.log(`No exact match found for: ${address}, using default coordinates`);
  return { lat: 32.0853, lng: 34.7818 }; // Default to Tel Aviv
};

// Create a new request
const createRequest = async (req, res) => {
  try {
    const { 
      locationInput, 
      latitude, 
      longitude,
      date, 
      numberOfPeople, 
      description 
    } = req.body;
    const seekerId = req.userId; // Use req.userId from JWT middleware

    console.log('Creating request with data:', {
      locationInput,
      latitude,
      longitude,
      date,
      numberOfPeople,
      seekerId
    });

    // Validate required fields
    if (!locationInput || !date || !numberOfPeople || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Geocode the address (use GPS coordinates if provided)
    const coordinates = await geocodeAddress(locationInput, latitude, longitude);

    console.log('Geocoded coordinates:', coordinates);

    // Create the request
    const request = await prisma.request.create({
      data: {
        locationInput,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        date: new Date(date),
        numberOfPeople: parseInt(numberOfPeople),
        description,
        seekerId
      },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Request created successfully:', request.id);

    res.status(201).json({
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

// Get all requests (with optional filters)
const getAllRequests = async (req, res) => {
  try {
    const { 
      location, 
      numberOfPeople, 
      date, 
      status,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};

    if (location) {
      where.locationInput = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (numberOfPeople) {
      where.numberOfPeople = {
        lte: parseInt(numberOfPeople)
      };
    }

    if (date) {
      where.date = {
        gte: new Date(date)
      };
    }

    if (status) {
      where.status = status;
    }

    // Get requests with pagination
    const requests = await prisma.request.findMany({
      where,
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            locationInput: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.request.count({ where });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            locationInput: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

// Update request (only by seeker)
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const seekerId = req.userId;
    const updateData = req.body;

    // Check if request exists and belongs to the user
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existingRequest.seekerId !== seekerId) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    // If location is being updated, geocode it
    if (updateData.locationInput && updateData.locationInput !== existingRequest.locationInput) {
      const coordinates = await geocodeAddress(updateData.locationInput);
      updateData.latitude = coordinates.lat;
      updateData.longitude = coordinates.lng;
    }

    // Convert date string to Date object if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // Convert numberOfPeople to integer if provided
    if (updateData.numberOfPeople) {
      updateData.numberOfPeople = parseInt(updateData.numberOfPeople);
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            locationInput: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      }
    });

    res.json({
      message: 'Request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

// Delete request (only by seeker)
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const seekerId = req.userId;

    // Check if request exists and belongs to the user
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existingRequest.seekerId !== seekerId) {
      return res.status(403).json({ error: 'Not authorized to delete this request' });
    }

    await prisma.request.delete({
      where: { id }
    });

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
};

// Get requests by seeker
const getRequestsBySeeker = async (req, res) => {
  try {
    const seekerId = req.userId;

    const requests = await prisma.request.findMany({
      where: { seekerId },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            locationInput: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching seeker requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsBySeeker
}; 