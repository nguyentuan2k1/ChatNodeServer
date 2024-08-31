const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const User = require('../models/User');
const Paginate     = require('../models/Pagination');
const helper = require('../services/helper');
const Presence = require("../models/Presence");
const Joi = require('joi');

exports.getChat = async (chatID) => {
        return await Chat.findById(chatID);
}

exports.getChatsIDByUserID = async (req, res) => {
        const {page = 1, pageSize = 15 } = req.query;

        let userID = await helper.getInfoCurrentUser(req, res);

        if (!userID) {
                return BaseResponse.customResponse(res, "Unauthorized", 0, 401, null);
        }

        let dataPaginate = await Paginate.paginate(Chat.find({users: { $in: userID }}), Chat.find({users: { $in: userID }}), parseInt(page) , parseInt(pageSize));
        let listChat     = dataPaginate.data;
        
        var listChatUserAndPresence = [];

        for (let index = 0; index < listChat.length; index++) {
                let room = listChat[index];

                room = room.toObject();

                let userLastMessage = await User.findById(room.userIDLastMessage ? room.userIDLastMessage : null);      

                room.userNameLastMessage = userLastMessage ? userLastMessage.name : "";

                if (room.type == "personal") {
                        let itemUSer;

                        if (room.users[0] == room.users[1]) {
                                itemUSer = room.users[0];
                        } else {
                                itemUSer = room.users.find(element => element != userID);
                        }

                        let user = await User.findById(itemUSer);

                        room.urlImage = user.urlImage ? user.urlImage : "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg"     ;
                        room.nameChat = user.name;
                }


                for (let index = 0; index < room.users.length; index++) {
                        let presence = await Presence.findOne({userID: room.users[index]});

                        room.users[index] = {
                                userID: room.users[index],
                                presence: presence.presence,
                                presenceTimeStamp: presence.presenceTimeStamp   
                        };
                }

                listChatUserAndPresence.push(room);
        }

        const { currentPage,total, totalPages} = dataPaginate;
            
        return BaseResponse.customResponse(res, "", 1, 200, {
          currentPage: currentPage,
          totalPages: totalPages,
          total: total,
          pageSize: parseInt(pageSize),
          data: listChatUserAndPresence,
        });
}

exports.updateMessageChat = async (chatID, message) => {
        let options = { returnDocument: 'after' }
        return await Chat.findByIdAndUpdate(chatID,
                {
                        $set: {
                                lastMessage: message.message,
                                timeLastMessage: message.stampTimeMessage,
                                userIDLastMessage: message.userID
                        }
                }, options);
}

exports.updateActiveChat = async (chatID) => {
        let options = { returnDocument: 'after' }
        return await Chat.findByIdAndUpdate(chatID,
                {
                        $set: {
                                active : true
                        }
                }, options);
}

exports.takeRoomChat = async (req, res) => {
        let {room_id, type, list_user_id} = req.body;

        const schema = Joi.object({
                type: Joi.string().valid('personal', 'group').required(),
                list_user_id: Joi.array().items(Joi.string()).required(),
        });

        const { error } = schema.validate(req.body);

        if (error) return BaseResponse.customResponse(res, error.details[0].message, 0, 400, null);
        
        let currentUserId = await helper.getInfoCurrentUser(req, res);
        
        if (!currentUserId) {
                return BaseResponse.customResponse(res, "Unauthorized", 0, 401, null);
        }

        let room;

        if (room_id) {
                room = await Chat.findById(room_id);

                if (!room) return BaseResponse.customResponse(res, "Room not found", 0, 404, null);
        } else {
                if (type == "personal") {
                        room = await Chat.findOne({users: { $all: [currentUserId, ...list_user_id] }, type: type});

                        if (!room) room = await Chat.create({users: [currentUserId, ...list_user_id], type: type, lastMessage: "", timeLastMessage: new Date(), userIDLastMessage: ""});
                } else {
                        room = await Chat.create({users: [currentUserId, ...list_user_id], type: type, lastMessage: "", timeLastMessage: new Date(), userIDLastMessage: ""});
                }
        }

        room = room.toObject();

        if (room.type == "personal") {
                let userId;

                if (room.users[0] == room.users[1]) {
                        userId = room.users[0];
                } else {
                        userId = room.users.find(element => element != currentUserId);
                }

                let user = await User.findById(userId);

                room.urlImage = user.urlImage ? user.urlImage : "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg";
                room.nameChat = user.name;
        }

        for (let index = 0; index < room.users.length; index++) {
                let presence = await Presence.findOne({userID: room.users[index]});

                room.users[index] = {
                        userID: room.users[index],
                        presence: presence.presence,
                        presenceTimeStamp: presence.presenceTimeStamp
                };
        }

        let userLastMessage = await User.findById(room.userIDLastMessage ? room.userIDLastMessage : null);      

        room.userNameLastMessage = userLastMessage ? userLastMessage.name : "";

        return BaseResponse.customResponse(res, "", 1, 200, room);
}

exports.logout = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return BaseResponse.customResponse(res, "No token provided", 0, 400, null);
    }

    // Blacklist the token
    helper.blacklistToken(token);

    return BaseResponse.customResponse(res, "Logged out successfully", 1, 200, null);
};