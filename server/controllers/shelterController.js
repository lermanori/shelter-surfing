import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Enhanced geocoding function for Israeli locations
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
    if (normalizedAddress.includes(city)) {
      console.log(`Found Israeli city match: ${city}`);
      return coords;
    }
  }

  // If no match found, try to use a geocoding service
  // For now, return default coordinates (Tel Aviv)
  console.log(`No exact match found for: ${address}, using default coordinates`);
  return { lat: 32.0853, lng: 34.7818 }; // Default to Tel Aviv
};

// Create a new shelter
const createShelter = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      locationInput, 
      latitude, 
      longitude,
      availableFrom, 
      availableTo, 
      capacity, 
      tags 
    } = req.body;
    const hostId = req.userId; // Use req.userId from JWT middleware

    console.log('Creating shelter with data:', {
      title,
      locationInput,
      latitude,
      longitude,
      hostId
    });

    // Validate required fields
    if (!title || !description || !locationInput || !availableFrom || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Geocode the address (use GPS coordinates if provided)
    const coordinates = await geocodeAddress(locationInput, latitude, longitude);

    console.log('Geocoded coordinates:', coordinates);

    // Create the shelter
    const shelter = await prisma.shelter.create({
      data: {
        title,
        description,
        locationInput,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        availableFrom: new Date(availableFrom),
        availableTo: availableTo ? new Date(availableTo) : null,
        capacity: parseInt(capacity),
        tags: tags || [],
        hostId
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Shelter created successfully:', shelter.id);

    res.status(201).json({
      message: 'Shelter created successfully',
      shelter
    });
  } catch (error) {
    console.error('Error creating shelter:', error);
    res.status(500).json({ error: 'Failed to create shelter' });
  }
};

// Get all shelters (with optional filters)
const getAllShelters = async (req, res) => {
  try {
    const { 
      location, 
      capacity, 
      availableFrom, 
      availableTo, 
      tags,
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

    if (capacity) {
      where.capacity = {
        gte: parseInt(capacity)
      };
    }

    if (availableFrom) {
      where.availableFrom = {
        gte: new Date(availableFrom)
      };
    }

    if (availableTo) {
      where.availableTo = {
        lte: new Date(availableTo)
      };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagArray
      };
    }

    // Get shelters with pagination
    const shelters = await prisma.shelter.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
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
    const total = await prisma.shelter.count({ where });

    res.json({
      shelters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
};

// Get shelter by ID
const getShelterById = async (req, res) => {
  try {
    const { id } = req.params;

    const shelter = await prisma.shelter.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      }
    });

    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    res.json({ shelter });
  } catch (error) {
    console.error('Error fetching shelter:', error);
    res.status(500).json({ error: 'Failed to fetch shelter' });
  }
};

// Update shelter (only by host)
const updateShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const hostId = req.userId;
    const updateData = req.body;

    // Check if shelter exists and belongs to the user
    const existingShelter = await prisma.shelter.findUnique({
      where: { id }
    });

    if (!existingShelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    if (existingShelter.hostId !== hostId) {
      return res.status(403).json({ error: 'Not authorized to update this shelter' });
    }

    // If location is being updated, geocode it
    if (updateData.locationInput && updateData.locationInput !== existingShelter.locationInput) {
      const coordinates = await geocodeAddress(updateData.locationInput);
      updateData.latitude = coordinates.lat;
      updateData.longitude = coordinates.lng;
    }

    // Convert date strings to Date objects if provided
    if (updateData.availableFrom) {
      updateData.availableFrom = new Date(updateData.availableFrom);
    }
    if (updateData.availableTo) {
      updateData.availableTo = new Date(updateData.availableTo);
    }

    // Convert capacity to integer if provided
    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }

    const updatedShelter = await prisma.shelter.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      }
    });

    res.json({
      message: 'Shelter updated successfully',
      shelter: updatedShelter
    });
  } catch (error) {
    console.error('Error updating shelter:', error);
    res.status(500).json({ error: 'Failed to update shelter' });
  }
};

// Delete shelter (only by host)
const deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const hostId = req.userId;

    // Check if shelter exists and belongs to the user
    const existingShelter = await prisma.shelter.findUnique({
      where: { id }
    });

    if (!existingShelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    if (existingShelter.hostId !== hostId) {
      return res.status(403).json({ error: 'Not authorized to delete this shelter' });
    }

    await prisma.shelter.delete({
      where: { id }
    });

    res.json({ message: 'Shelter deleted successfully' });
  } catch (error) {
    console.error('Error deleting shelter:', error);
    res.status(500).json({ error: 'Failed to delete shelter' });
  }
};

// Get shelters by host
const getSheltersByHost = async (req, res) => {
  try {
    const hostId = req.userId;

    const shelters = await prisma.shelter.findMany({
      where: { hostId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage1: true,
            profileImage2: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ shelters });
  } catch (error) {
    console.error('Error fetching host shelters:', error);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
};

export {
  createShelter,
  getAllShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
  getSheltersByHost
}; 