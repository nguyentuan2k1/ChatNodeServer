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

        let userID       = await helper.getInfoCurrentUser(req, res);        
        let dataPaginate = await Paginate.paginate(Chat.find({users: { $in: userID }}), Chat.find({users: { $in: userID }}), parseInt(page) , parseInt(pageSize));
        let listChat     = dataPaginate.data;
        
        var listChatUserAndPresence = [];

        for (let index = 0; index < listChat.length; index++) {
                const element = listChat[index];
                var findUserFriend;
                if (element.users.length == 2) {
                        if (
                          element.users[0] == userID &&
                          element.users[1] == userID
                        ) {
                          findUserFriend = userID;
                        } else {
                          findUserFriend = element.users.find(
                            (element) => element != userID
                          );
                        }
                } else { 

                }

                const userFriend = await User.findById(findUserFriend);
                let   presence   = await Presence.findOne({userID: findUserFriend});                
                
                listChatUserAndPresence.push({
                        name : userFriend.name,
                        urlImage : userFriend.urlImage ? userFriend.urlImage : "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg" ,
                        presence : presence.presence,
                        users : element.users,
                        lastMessage : element.lastMessage,
                        typeMessage : element.typeMessage,
                        timeLastMessage : element.timeLastMessage,
                        presence_timestamp : presence.presenceTimeStamp,
                        });
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

        return BaseResponse.customResponse(res, "", 1, 200, room);
}