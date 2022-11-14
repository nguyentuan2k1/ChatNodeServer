const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
exports.getChat = async (chatID) => {
        return await Chat.findById(chatID);
}
exports.getChatsIDByUserID = async (userID) => {
        return await Chat.find({ users: userID }, { roll: 1 });
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