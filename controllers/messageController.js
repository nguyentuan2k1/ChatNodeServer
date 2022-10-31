const chatController = require("../controllers/chatController");

const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
        const chat = await chatController.getChat(req.body.chatID);
        if (!chat) {
                return res.status(404).json({
                        error: "Cant find chat"
                });
        }
        const message = new Message(
                req.body.userID,
                req.body.message,
                req.body.urlImageMessage,
                req.body.urlRecordMessage,
                Date.now(),
                req.body.typeMessage,
                req.body.messageStatus
        );
        await chat.updateOne({ $push: { messages: message } });
        const getChat = await chatController.getChat(chat.id);
        return res.status(200).json({
                getChat
        });
}