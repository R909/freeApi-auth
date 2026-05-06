import { createUser, findUserByUsername, findUserByEmail, findUserById, comparePassword } from '../services/auth.service.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, role = 'USER' } = req.body;

    // Basic validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check existing
    const existingUser = await findUserByUsername(username) || await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    const user = await createUser({ username: username.toLowerCase().trim(), email: email.toLowerCase().trim(), password, role: role.toUpperCase() });

    const token = signToken(user._id);

    res
      .status(201)
      .cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, data: { _id: user._id, username: user.username, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const user = await findUserByUsername(username);
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res
      .cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, data: { _id: user._id, username: user.username, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' })
     .json({ success: true, message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { _id: user._id, username: user.username, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
  } catch (error) {
    console.error('Current user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

