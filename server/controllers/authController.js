import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'SEEKER' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase()
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

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      locationInput: user.locationInput,
      latitude: user.latitude,
      longitude: user.longitude,
      profileImage1: user.profileImage1,
      profileImage2: user.profileImage2,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware

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
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Current user retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 