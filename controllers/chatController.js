const Chat = require("../models/Chat");
exports.getChat = async (chatID) => {
        return await Chat.findById(chatID);
}
exports.updateMessageChat = async (chatID, message) => {
        let options = { returnDocument: 'after' }
        return await Chat.findByIdAndUpdate(chatID,
                {
                        $set: {
                                lastMessage: message.message,
                                timeLastMessage: message.stampTimeMessage
                        }, $push: {
                                messages: message
                        }
                }, options);
}