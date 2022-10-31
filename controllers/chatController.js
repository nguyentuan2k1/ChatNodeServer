const Chat = require("../models/Chat");
exports.getChat = async(chatID) => {
        return await Chat.findById(chatID);
}