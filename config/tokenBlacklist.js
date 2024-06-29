// config/tokenBlacklist.js
import { readData, writeData } from './fileStorage.js';

const blacklistFile = process.env.TOKEN_BLACKLIST_FILE || 'blacklist.json';

export const isTokenBlacklisted = (token) => {
    const blacklist = readData(blacklistFile);
    return blacklist.some(entry => entry.token === token);
};

export const addToBlacklist = (token, expiry) => {
    const blacklist = readData(blacklistFile);
    if (!blacklist.some(entry => entry.token === token)) {
        blacklist.push({ token, expiry });
        writeData(blacklistFile, blacklist);
    }
};

export const cleanExpiredTokens = () => {
    const blacklist = readData(blacklistFile);
    const now = Date.now();
    const updatedBlacklist = blacklist.filter(entry => entry.expiry > now);
    writeData(blacklistFile, updatedBlacklist);
};
