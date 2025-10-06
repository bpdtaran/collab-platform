// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// --- REGISTER ---
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    // ADDED .normalizeEmail() to ensure email is lowercase and trimmed
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // The email from req.body is now normalized
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // The pre-save hook in your User model will hash the password
      const user = new User({ name, email, password });
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      res.status(201).json({
        message: 'User created successfully',
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// --- LOGIN ---
router.post(
  '/login',
  [
    // ADDED .normalizeEmail() here as well
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // The email from req.body is now normalized
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password using the model's method
      const isPasswordValid = await user.correctPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user._id);

      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      res.json({
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// --- REFRESH TOKEN ---
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { accessToken } = generateTokens(decoded.userId);

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// --- GET CURRENT USER ('ME') ---
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      isOnline: req.user.isOnline,
    },
  });
});

// --- LOGOUT ---
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- TEMPORARY DEMO USER SEED ROUTE ---
// (Run this once, then remove it for security)
router.post('/dev/seed-demo', async (req, res) => {
  try {
    const email = 'demo@workspace.com';
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: 'Demo user already exists.' });
    }
    const demoUser = new User({
      name: 'Demo User',
      email: email,
      password: 'demo123', // The pre-save hook will hash this
    });
    await demoUser.save();
    res.status(201).json({ message: 'Demo user created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed demo user.', error: error.message });
  }
});


module.exports = router;