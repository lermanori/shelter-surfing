import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Enhanced geocoding function for Israeli locations (same as other controllers)
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

  // If no match found, return default coordinates (Tel Aviv)
  console.log(`No exact match found for: ${address}, using default coordinates`);
  return { lat: 32.0853, lng: 34.7818 }; // Default to Tel Aviv
};

// PUT /api/users/profile - Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      name, 
      email, 
      locationInput, 
      latitude, 
      longitude, 
      role,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      telegram,
      website
    } = req.body;

    console.log('Updating profile with data:', {
      name,
      email,
      locationInput,
      latitude,
      longitude,
      role,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      telegram,
      website,
      userId
    });

    // Validation
    if (!name || !email || !locationInput) {
      return res.status(400).json({ 
        error: 'Name, email, and location are required' 
      });
    }

    // Check if email is already taken by another user
    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (emailConflict) {
      return res.status(400).json({ 
        error: 'Email is already taken by another user' 
      });
    }

    // Geocode the address (use GPS coordinates if provided)
    const coordinates = await geocodeAddress(locationInput, latitude, longitude);

    console.log('Geocoded coordinates:', coordinates);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        locationInput,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        ...(role && { role: role.toUpperCase() }),
        // Social media fields
        ...(facebook !== undefined && { facebook }),
        ...(instagram !== undefined && { instagram }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(telegram !== undefined && { telegram }),
        ...(website !== undefined && { website })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationInput: true,
        latitude: true,
        longitude: true,
        profileImage1: true,
        profileImage2: true,
        facebook: true,
        instagram: true,
        twitter: true,
        linkedin: true,
        whatsapp: true,
        telegram: true,
        website: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('Profile updated successfully:', updatedUser.id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/users/:id - Update specific user (admin or self)
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;
    const { name, email, locationInput, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow users to update their own profile or admins to update any profile
    if (existingUser.id !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    // Validation
    if (!name || !email || !locationInput) {
      return res.status(400).json({ 
        error: 'Name, email, and location are required' 
      });
    }

    // Check if email is already taken by another user
    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (emailConflict) {
      return res.status(400).json({ 
        error: 'Email is already taken by another user' 
      });
    }

    // Geocode the address
    const coordinates = await geocodeAddress(locationInput);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        locationInput,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        ...(role && { role: role.toUpperCase() })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationInput: true,
        latitude: true,
        longitude: true,
        profileImage1: true,
        profileImage2: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users/profile - Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationInput: true,
        latitude: true,
        longitude: true,
        profileImage1: true,
        profileImage2: true,
        facebook: true,
        instagram: true,
        twitter: true,
        linkedin: true,
        whatsapp: true,
        telegram: true,
        website: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users - List users (admin only)
export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationInput: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Users retrieved successfully',
      data: { users }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users/:id - Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationInput: true,
        profileImage1: true,
        profileImage2: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User retrieved successfully',
      user: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 