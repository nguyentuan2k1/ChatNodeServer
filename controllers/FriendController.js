const { default: mongoose } = require('mongoose');
const BaseResponse = require('../models/BaseResponse');
const Friends = require('../models/Friends');
let options = { returnDocument: 'after' }
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const helper = require('../services/helper')

dotenv.config();

exports.getFriends = async (req, res) => {
    try {
        let userId       = await helper.getInfoCurrentUser(req, res);
        const getFriends = await Friends.find({userID: userId});
        const friendIds  = getFriends.map(item => item.friendId);

        let listFriend = await User.find({ _id: { $in: friendIds } })

        listFriend = listFriend.map(item => ({
            name: item.name,
            imageUrl: item.imageUrl ?? null,
            presence : true,
        }));

        return BaseResponse.customResponse(res, "", 1, 200, listFriend);
    } catch (e) {
        return BaseResponse.customResponse(res, e.toString(), 0, 500);
    }
}
      
