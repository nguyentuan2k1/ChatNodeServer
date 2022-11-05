const User = require('../models/User');
const Presence = require('../models/Presence');
const jwt = require("jsonwebtoken");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const Chat = require('../models/Chat');
const Friends = require('../models/Friends');
const Users = require('../models/User');
const UserAndPresence = require('../models/UserAndPresence');
const ChatUserAndPresence = require('../models/ChatUserAndPresence');
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
exports.getChats = async (req, res) => {
        try {
                console.log(req.body.userID);
                const chats = await Chat.find({ users: req.body.userID });
                console.log(chats.toString());
                var listChatUserAndPresence = [];
                for (let index = 0; index < chats.length; index++) {
                        const element = chats[index];
                        var findUserFriend;
                        if (element.users.length == 2) {
                                if (element.users[0] == req.body.userID && element.users[1] == req.body.userID) {
                                        findUserFriend = req.body.userID;
                                }
                                else {
                                        findUserFriend = element.users.find((element) => element != req.body.userID);
                                }
                        }
                        const userFriend = await getUser(findUserFriend);
                        const presence = await getPresenceByUserID(findUserFriend);
                        listChatUserAndPresence.push(new ChatUserAndPresence(element, userFriend, presence));
                }
                return res.status(200).json(
                        new BaseResponse(
                                1,
                                Date.now(),
                                listChatUserAndPresence,
                                new Errors(
                                        200,
                                        listChatUserAndPresence.length == 0 ? "You need add some chat" : ""
                                )
                        )
                );

        } catch (error) {
                return res.status(500).json(new BaseResponse(
                        -1,
                        Date.now(),
                        []
                        ,
                        new Errors(
                                500,
                                error.toString()
                        )
                ));
        }
}

exports.createAndJoinChat = async (req, res) => {
        try {
                var chat = await Chat.findOne({
                        users: [req.body.userID, req.body.userIDFriend]

                });
                var userIDFriend = req.body.userIDFriend;
                if (!chat) {
                        chat = await Chat.findOne({
                                users: [req.body.userIDFriend, req.body.userID]
        
                        });
                        if(!chat)
                        {
                                chat = await new Chat({
                                        users: [req.body.userID, req.body.userIDFriend],
                                        active: false,
                                        lastMessage: "xin chào",
                                        userIDLastMessage: req.body.userID,
                                        timeLastMessage: Date.now()
                                }).save();
                        }
                }
                var userFriend = await getUser(userIDFriend);
                var presenceFriend = await getPresenceByUserID(userIDFriend);
                const chatUserAndPresence = new ChatUserAndPresence(chat, userFriend, presenceFriend);
                return res.status(200).json(
                        new BaseResponse(
                                1,
                                Date.now(),
                                [
                                        chatUserAndPresence
                                ],
                                new Errors(
                                        200,
                                        ""
                                )
                        )
                );
        } catch (error) {
                console.log(req.body.userID);
                console.log(error.toString());
                return res.status(500).json(
                        new BaseResponse(
                                -1,
                                Date.now(),
                                [],
                                new Errors(
                                        500,
                                        error.toString(),
                                )
                        )
                );
        }
}
const getUser = async (userID) => {
        const findUser = await User.findById(userID);
        if (!findUser) {
                return null;
        } else {
                return findUser;
        }
}
const getPresenceByUserID = async (userID) => {
        const findPresence = await Presence.findOne({ userID: userID });
        if (!findPresence) {
                return null;
        }
        return findPresence;
}