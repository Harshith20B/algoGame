    const express = require('express');
    const router = express.Router();
    const jwt = require('jsonwebtoken');
    const User = require('./userModel');

    // authRouter.js - Enhanced error handling
    router.post('/signup', async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
    
            // Input validation
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
    
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
    
            // Check existing user
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return res.status(409).json({ error: `User with this ${existingUser.email === email ? 'email' : 'username'} already exists` });
            }
    
            // Save user to database
            const user = new User({ username, email, password });
            await user.save();
    
            return res.status(201).json({ message: 'User created successfully' }); // No token here
        } catch (error) {
            next(error);
        }
    });
    
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            const error = new Error('Username and password are required');
            error.status = 400;
            throw error;
        }

        const user = await User.findOne({ username });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            userId: user._id
        });
    } catch (error) {
        next(error);
    }
});
    module.exports = router;