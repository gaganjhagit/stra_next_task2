import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'password123';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Login a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null if login fails
 */
export async function login(email, password) {
  const [rows] = await pool.execute(
    'SELECT id, email, password, name, role FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user from cookie
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  // Verify user still exists in database
  const [rows] = await pool.execute(
    'SELECT id, email, name, role FROM users WHERE id = ?',
    [user.id]
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
    role: rows[0].role,
  };
}

/**
 * Set auth token in cookie
 * @param {string} token - JWT token
 */
export async function setAuthToken(token) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear auth token from cookie
 */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
