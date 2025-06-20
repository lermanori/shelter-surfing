import { PrismaClient } from '@prisma/client';
import socketService from '../services/socketService.js';

const prisma = new PrismaClient();

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.userId;

    // Validate recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId }
        ]
      }
    });

    if (existingConnection) {
      if (existingConnection.status === 'PENDING') {
        return res.status(400).json({ error: 'Connection request already pending' });
      } else if (existingConnection.status === 'APPROVED') {
        return res.status(400).json({ error: 'Already connected with this user' });
      }
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requesterId,
        recipientId,
        message: message || null
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emit Socket.IO event for real-time notification
    socketService.sendConnectionRequest(recipientId, {
      type: 'connection_request',
      connection,
      requester: connection.requester
    });

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
};

// Get connection requests (received by current user)
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await prisma.connection.findMany({
      where: {
        recipientId: userId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            locationInput: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Connection requests retrieved successfully',
      connections
    });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ error: 'Failed to fetch connection requests' });
  }
};

// Approve connection request
export const approveConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    if (connection.recipientId !== userId) {
      return res.status(403).json({ error: 'Not authorized to approve this request' });
    }

    if (connection.status !== 'PENDING') {
      return res.status(400).json({ error: 'Connection request is not pending' });
    }

    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'APPROVED' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emit Socket.IO events for real-time updates
    socketService.sendConnectionUpdate(connection.requesterId, {
      type: 'connection_approved',
      connection: updatedConnection,
      approvedBy: updatedConnection.recipient
    });

    socketService.sendConnectionUpdate(connection.recipientId, {
      type: 'connection_approved',
      connection: updatedConnection,
      approvedBy: updatedConnection.recipient
    });

    res.json({
      message: 'Connection approved successfully',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('Error approving connection:', error);
    res.status(500).json({ error: 'Failed to approve connection' });
  }
};

// Reject connection request
export const rejectConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    if (connection.recipientId !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    if (connection.status !== 'PENDING') {
      return res.status(400).json({ error: 'Connection request is not pending' });
    }

    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'REJECTED' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emit Socket.IO event for real-time notification
    socketService.sendConnectionUpdate(connection.requesterId, {
      type: 'connection_rejected',
      connection: updatedConnection,
      rejectedBy: updatedConnection.recipient
    });

    res.json({
      message: 'Connection rejected successfully',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    res.status(500).json({ error: 'Failed to reject connection' });
  }
};

// Get all connection statuses for the current user
export const getAllConnectionStatuses = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { recipientId: userId }
        ]
      },
      select: {
        requesterId: true,
        recipientId: true,
        status: true,
        id: true
      }
    });

    const statusMap = {};
    connections.forEach(conn => {
      const otherUserId = conn.requesterId === userId ? conn.recipientId : conn.requesterId;
      statusMap[otherUserId] = {
        connected: conn.status === 'APPROVED',
        status: conn.status,
        connectionId: conn.id
      };
    });

    res.json({
      message: 'Connection statuses retrieved successfully',
      data: {
        statuses: statusMap
      }
    });
  } catch (error) {
    console.error('Error fetching all connection statuses:', error);
    res.status(500).json({ error: 'Failed to fetch connection statuses' });
  }
};

// Get user's connections (approved)
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { recipientId: userId }
        ],
        status: 'APPROVED'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            locationInput: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            locationInput: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform to show the other user in each connection
    const transformedConnections = connections.map(connection => {
      const otherUser = connection.requesterId === userId 
        ? connection.recipient 
        : connection.requester;
      
      return {
        id: connection.id,
        otherUser,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt
      };
    });

    res.json({
      message: 'Connections retrieved successfully',
      connections: transformedConnections
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

// Check if two users are connected
export const checkConnection = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.userId;

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, recipientId: otherUserId },
          { requesterId: otherUserId, recipientId: currentUserId }
        ]
      }
    });

    if (!connection) {
      return res.json({
        connected: false,
        status: null
      });
    }

    res.json({
      connected: connection.status === 'APPROVED',
      status: connection.status,
      connectionId: connection.id
    });
  } catch (error) {
    console.error('Error checking connection:', error);
    res.status(500).json({ error: 'Failed to check connection' });
  }
}; 