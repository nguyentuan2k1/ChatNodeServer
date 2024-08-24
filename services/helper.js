const BaseResponse = require('../models/BaseResponse');
const dotenv       = require("dotenv");
const jwt          = require("jsonwebtoken");

dotenv.config();

class Helper {
    static async getInfoCurrentUser (req, res) {
        const authHeader = req.headers['authorization'];        
        
        
        const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN'

        if (blacklistedTokens.has(token)) {
            return res.status(401).json({ message: 'Token is blacklisted' });
          }

  
        if (!token) return BaseResponse.customResponse(res, "Token is required", 0, 401);
        
        let userId = "";
        
        jwt.verify(token, process.env.SECRET_KEY_JWT, (err, user) => {
        if (err) return BaseResponse.customResponse(res, "Token is not valid", 0, 401);
    
        userId = user.id;
        });

        return userId;
    }
}
module.exports = Helper;