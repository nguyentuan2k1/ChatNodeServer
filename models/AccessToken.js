const mongoose = require('mongoose');

const AccessTokenSchema = new mongoose.Schema({
        accessToken: {
                type: String,
                required: true,
        },
        userID: {
                type: String,
                required: true,
        },
        refreshToken: {
                type: String,
                required: true,
        },
        refreshExpiredTime: {
                type: Number,
                required: true,
        },
        expiredTime: {
                type: Number,
                required: true,
        },
        active: {
                type: Boolean,
                default: true,
        }
}, { timestamps: true }
);

module.exports = mongoose.model("AccessToken", AccessTokenSchema);