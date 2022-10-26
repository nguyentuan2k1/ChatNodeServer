const User = require('../models/User');
const Presence = require('../models/Presence');
const jwt = require("jsonwebtoken");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const Chat = require('../models/Chat');
const Friends = require('../models/Friends');
const Users = require('../models/User');
const UserAndPresence = require('../models/UserAndPresence');
exports.findChatByKeyWord = async (req, res) => {
        try {
                var listFriends;
                var listUserInfomation = [];
                if (req.body.keyword == null || req.body.keyword == "") {
                        listFriends = await Friends.find({
                                nameChat: { $gt: "!= null" }
                        }).limit(10);
                }
                else {
                        listFriends = await Friends.find({
                                nameChat: { $regex: req.body.keyword, $options: "i" }
                        }).limit(10);
                }
                for (let index = 0; index < listFriends.length; index++) {
                        const element = listFriends[index];
                        const user = await getUser(element.userID);
                        const presence = await getPresenceByUserID(element.userID);
                        const friend = new UserAndPresence(user, presence);
                        listUserInfomation.push(friend);
                }
                return res.status(200).json(
                        listUserInfomation
                );
        } catch (error) {
                console.log(error.toString());
                return res.status(500).json([]);
        }
}
const getUser = async (userID) => {
        return await User.findById(userID);
}
const getPresenceByUserID = async (userID) => {
        return await Presence.findOne({ userID: userID });
}