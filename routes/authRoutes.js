// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData, writeData } from '../config/fileStorage.js';
import dotenv from 'dotenv';
import auth from '../middlewares/auth.js';
import { addToBlacklist } from '../config/tokenBlacklist.js';

dotenv.config();

const router = express.Router();

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const users = readData('users.json');
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ msg: 'User already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
    users.push(newUser);
    writeData('users.json', users);
    res.status(201).json({ msg: 'User registered successfully' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readData('users.json');
    const user = users.find(user => user.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

router.post('/refresh-token', auth, (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ msg: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const users = readData('users.json');
        const user = users.find(user => user.id === decoded.id);
        if (!user) {
            return res.status(403).json({ msg: 'Invalid refresh token' });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(403).json({ msg: 'Invalid refresh token' });
    }
});

router.post('/logout', auth, (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.decode(token);
    const expiry = decoded.exp * 1000; // Convert to milliseconds
    addToBlacklist(token, expiry);
    res.json({ msg: 'Logged out successfully' });
});

export default router;
