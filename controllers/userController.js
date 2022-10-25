const User = require('../models/User');
const Presence = require('../models/Presence');
const jwt = require("jsonwebtoken");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const Chat = require('../models/Chat');
const Friends = require('../models/Friends');

exports.findChatByKeyWord = async (req, res) => {
        try {
                var listFriends;
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
                return res.status(200).json(
                        {
                                chats: listFriends,
                        }
                );
        } catch (error) {
                return res.status(500).json(error.toString());
        }
}