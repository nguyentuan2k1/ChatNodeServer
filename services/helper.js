const BaseResponse = require('../models/BaseResponse');
const dotenv       = require("dotenv");
const jwt          = require("jsonwebtoken");

dotenv.config();

const blacklistedTokens = new Set();

class Helper {
    static async getInfoCurrentUser (req, res) {
        const authHeader = req.headers['authorization'];        
        
        const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN'

        if (!token) {
            return null;
        }

        if (blacklistedTokens.has(token)) {
            return null;
        }
  
        try {
            const user = jwt.verify(token, process.env.SECRET_KEY_JWT);
            return user.id;
        } catch (err) {
            return null;
        }
    }

    static async getCurrentUserIdByToken(token) {
        if (blacklistedTokens.has(token)) {
            return false;
        }

        try {
            const user = jwt.verify(token, process.env.SECRET_KEY_JWT);
            return user.id;
        } catch (err) {
            return false;
        }
    }

    // Add a method to blacklist a token
    static blacklistToken(token) {
        blacklistedTokens.add(token);
    }
}

module.exports = Helper;