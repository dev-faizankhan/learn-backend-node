// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { cleanExpiredTokens, isTokenBlacklisted } from '../config/tokenBlacklist.js';

dotenv.config();

const auth = (req, res, next) => {
    cleanExpiredTokens(); // Clean expired tokens on each request

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ msg: 'Token is blacklisted, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded.id; // Attach user ID to request object
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export default auth;
