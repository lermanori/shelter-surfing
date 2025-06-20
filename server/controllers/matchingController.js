import { PrismaClient } from '@prisma/client';
import { filterSheltersByDistance, haversineDistance } from '../utils/distance.js';

const prisma = new PrismaClient();

// GET /api/matches - Get matching shelters for a user's requests
export const getMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const { maxDistance = 50, limit = 20 } = req.query;

    // Get user's active requests
    const userRequests = await prisma.request.findMany({
      where: {
        seekerId: userId,
        status: 'PENDING' // Only get pending requests
      },
      include: {
        seeker: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (userRequests.length === 0) {
      return res.json({
        message: 'No active requests found',
        data: { matchesByRequest: [], requests: [] }
      });
    }

    // Get all available shelters (using isActive instead of status)
    const availableShelters = await prisma.shelter.findMany({
      where: {
        isActive: true, // Use isActive instead of status
        hostId: {
          not: userId // Exclude shelters created by the same user
        }
      },
      include: {
        host: {
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

    console.log(`Found ${availableShelters.length} available shelters`);

    // Group matches by request
    const matchesByRequest = [];
    let totalMatches = 0;
    
    for (const request of userRequests) {
      console.log(`Processing request ${request.id} at location: ${request.latitude}, ${request.longitude}`);
      
      if (!request.latitude || !request.longitude) {
        console.log(`Request ${request.id} has no coordinates, skipping`);
        continue; // Skip requests without coordinates
      }

      // Filter shelters by distance
      const nearbyShelters = filterSheltersByDistance(
        availableShelters,
        request.latitude,
        request.longitude,
        parseInt(maxDistance)
      );

      console.log(`Found ${nearbyShelters.length} shelters within ${maxDistance}km of request ${request.id}`);

      // Filter shelters by date availability
      const dateFilteredShelters = nearbyShelters.filter(shelter => {
        const requestDate = new Date(request.date);
        const shelterFrom = new Date(shelter.availableFrom);
        const shelterTo = shelter.availableTo ? new Date(shelter.availableTo) : null;
        
        // Check if request date falls within shelter availability period
        const isDateMatch = requestDate >= shelterFrom && 
                           (shelterTo === null || requestDate <= shelterTo);
        
        console.log(`Shelter ${shelter.id}: request date ${requestDate.toISOString()}, available ${shelterFrom.toISOString()} to ${shelterTo?.toISOString() || 'no end'}, match: ${isDateMatch}`);
        
        return isDateMatch;
      });

      console.log(`Found ${dateFilteredShelters.length} shelters with matching dates for request ${request.id}`);

      // Add request info to each shelter match
      const requestMatches = dateFilteredShelters.slice(0, parseInt(limit)).map(shelter => ({
        ...shelter,
        requestId: request.id,
        requestDate: request.date,
        requestPeople: request.numberOfPeople,
        requestLocation: request.locationInput,
        requestStatus: request.status
      }));

      // Sort by distance
      const sortedMatches = requestMatches.sort((a, b) => a.distance - b.distance);

      matchesByRequest.push({
        request: {
          id: request.id,
          locationInput: request.locationInput,
          date: request.date,
          numberOfPeople: request.numberOfPeople,
          description: request.description,
          status: request.status
        },
        matches: sortedMatches,
        matchCount: sortedMatches.length
      });

      totalMatches += sortedMatches.length;
    }

    console.log(`Returning ${totalMatches} total matches across ${matchesByRequest.length} requests`);

    res.json({
      message: 'Matches retrieved successfully',
      data: {
        matchesByRequest: matchesByRequest,
        requests: userRequests,
        totalMatches: totalMatches,
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/matches/request/:requestId - Get matches for a specific request
export const getMatchesForRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;
    const { maxDistance = 50, limit = 20 } = req.query;

    // Get the specific request
    const request = await prisma.request.findFirst({
      where: {
        id: requestId,
        seekerId: userId
      },
      include: {
        seeker: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!request.latitude || !request.longitude) {
      return res.status(400).json({ error: 'Request location not available' });
    }

    // Get available shelters (using isActive instead of status)
    const availableShelters = await prisma.shelter.findMany({
      where: {
        isActive: true, // Use isActive instead of status
        hostId: {
          not: userId // Exclude shelters created by the same user
        }
      },
      include: {
        host: {
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

    // Filter shelters by distance
    const matches = filterSheltersByDistance(
      availableShelters,
      request.latitude,
      request.longitude,
      parseInt(maxDistance)
    ).slice(0, parseInt(limit));

    // Add request info to matches
    const matchesWithRequest = matches.map(shelter => ({
      ...shelter,
      requestId: request.id,
      requestDate: request.date,
      requestPeople: request.numberOfPeople,
      requestLocation: request.locationInput,
      requestStatus: request.status
    }));

    res.json({
      message: 'Matches for request retrieved successfully',
      data: {
        matches: matchesWithRequest,
        request: request,
        totalMatches: matchesWithRequest.length,
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Get matches for request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/matches/shelter/:shelterId - Get requests that match a specific shelter
export const getRequestsForShelter = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const userId = req.userId;
    const { maxDistance = 50, limit = 20 } = req.query;

    // Get the specific shelter
    const shelter = await prisma.shelter.findFirst({
      where: {
        id: shelterId,
        hostId: userId,
        isActive: true
      }
    });

    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    if (!shelter.latitude || !shelter.longitude) {
      return res.status(400).json({ error: 'Shelter location not available' });
    }

    // Get all pending requests
    const pendingRequests = await prisma.request.findMany({
      where: {
        status: 'PENDING'
      },
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

    // Filter requests by distance and date compatibility
    const matchingRequests = pendingRequests.filter(request => {
      if (!request.latitude || !request.longitude) {
        return false;
      }

      // Check distance
      const distance = haversineDistance(
        shelter.latitude,
        shelter.longitude,
        request.latitude,
        request.longitude
      );

      if (distance > maxDistance) {
        return false;
      }

      // Check date compatibility
      const requestDate = new Date(request.date);
      if (requestDate < shelter.availableFrom) {
        return false;
      }

      if (shelter.availableTo && requestDate > shelter.availableTo) {
        return false;
      }

      // Check capacity
      if (request.numberOfPeople > shelter.capacity) {
        return false;
      }

      return true;
    }).map(request => {
      const distance = haversineDistance(
        shelter.latitude,
        shelter.longitude,
        request.latitude,
        request.longitude
      );

      return {
        ...request,
        distance: Math.round(distance * 10) / 10
      };
    }).sort((a, b) => a.distance - b.distance)
    .slice(0, parseInt(limit));

    res.json({
      message: 'Matching requests for shelter retrieved successfully',
      data: {
        requests: matchingRequests,
        shelter: shelter,
        totalRequests: matchingRequests.length,
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Get requests for shelter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/matches/host - Get matching requests for a host's shelters
export const getHostMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const { maxDistance = 50, limit = 20 } = req.query;

    // Get user's active shelters
    const userShelters = await prisma.shelter.findMany({
      where: {
        hostId: userId,
        isActive: true
      },
      include: {
        host: {
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

    console.log(`Found ${userShelters.length} active shelters for host ${userId}`);

    if (userShelters.length === 0) {
      return res.json({
        message: 'No active shelters found',
        data: { matches: [], shelters: [] }
      });
    }

    // Get all pending requests
    const pendingRequests = await prisma.request.findMany({
      where: {
        status: 'PENDING'
      },
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

    console.log(`Found ${pendingRequests.length} pending requests`);

    // Find matches for each shelter
    const matches = [];
    
    for (const shelter of userShelters) {
      console.log(`Processing shelter ${shelter.id} at location: ${shelter.latitude}, ${shelter.longitude}`);
      
      if (!shelter.latitude || !shelter.longitude) {
        console.log(`Shelter ${shelter.id} has no coordinates, skipping`);
        continue;
      }

      // Filter requests by distance and compatibility
      const matchingRequests = pendingRequests.filter(request => {
        if (!request.latitude || !request.longitude) {
          return false;
        }

        // Check distance
        const distance = haversineDistance(
          shelter.latitude,
          shelter.longitude,
          request.latitude,
          request.longitude
        );

        if (distance > parseInt(maxDistance)) {
          return false;
        }

        // Check date compatibility
        const requestDate = new Date(request.date);
        if (requestDate < shelter.availableFrom) {
          return false;
        }

        if (shelter.availableTo && requestDate > shelter.availableTo) {
          return false;
        }

        // Check capacity
        if (request.numberOfPeople > shelter.capacity) {
          return false;
        }

        return true;
      }).map(request => {
        const distance = haversineDistance(
          shelter.latitude,
          shelter.longitude,
          request.latitude,
          request.longitude
        );

        return {
          ...request,
          shelter: {
            id: shelter.id,
            title: shelter.title,
            locationInput: shelter.locationInput,
            capacity: shelter.capacity,
            availableFrom: shelter.availableFrom,
            availableTo: shelter.availableTo,
            images: shelter.images,
            tags: shelter.tags,
            host: shelter.host
          },
          distance: Math.round(distance * 10) / 10
        };
      });

      console.log(`Found ${matchingRequests.length} requests matching shelter ${shelter.id}`);

      matches.push(...matchingRequests);
    }

    // Sort by distance and limit results
    const sortedMatches = matches
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    console.log(`Returning ${sortedMatches.length} total host matches`);

    res.json({
      message: 'Host matches retrieved successfully',
      data: {
        matches: sortedMatches,
        shelters: userShelters,
        totalMatches: sortedMatches.length,
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Get host matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 