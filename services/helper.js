const BaseResponse = require('../models/BaseResponse');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AccessToken = require('../models/AccessToken');

dotenv.config();

class Helper {
    static async getInfoCurrentUser(req, res) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN'

        if (!token) {
            return null;
        }

        try {
            const tokenData = await AccessToken.findOne({ accessToken: token, active: true });
            if (!tokenData) {
                return null;
            }

            if (tokenData.expiredTime < Date.now()) {
                tokenData.active = false;
                await tokenData.save();
                return null;
            }

            const user = jwt.verify(token, process.env.SECRET_KEY_JWT);
            return user.id;
        } catch (err) {
            return null;
        }
    }

    static async getCurrentUserIdByToken(token) {
        try {
            const tokenData = await AccessToken.findOne({ accessToken: token, active: true });
            if (!tokenData) {
                return false;
            }

            if (tokenData.expiredTime < Date.now()) {
                tokenData.active = false;
                await tokenData.save();
                return false;
            }

            const user = jwt.verify(token, process.env.SECRET_KEY_JWT);
            return user.id;
        } catch (err) {
            return false;
        }
    }

    static async blacklistToken(token) {
        try {
            await AccessToken.findOneAndUpdate(
                { accessToken: token },
                { $set: { active: false } }
            );
        } catch (err) {
            console.error("Error blacklisting token:", err);
        }
    }
}

module.exports = Helper;