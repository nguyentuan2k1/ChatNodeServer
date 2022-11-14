const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const ChatMessages = require("../models/ChatMessages");

let options = { returnDocument: 'after' }
exports.insertManyChatMessage = async (req, res) => {
        try {
                const chats = await Chat.find();
                for (let index = 0; index < chats.length; index++) {
                        const element = chats[index];

                        for (let j = 0; j < element.messages.length; j++) {
                                const e = element.messages[j];
                                await new ChatMessages({
                                        chatID: element.id,
                                        userID: e.userID,
                                        message: e.message,
                                        urlImageMessage: [],
                                        urlRecordMessage: " ",
                                        stampTimeMessage: e.stampTimeMessage,
                                        typeMessage: e.typeMessage,
                                        messageStatus: e.messageStatus
                                }).save();
                        }
                }
                return res.status(200).json(
                        "Success"
                );
        } catch (error) {
                return res.status(200).json(
                        error.toString()
                );
        }

}

exports.updateStatusSentMessage = async (chatID, userID) => {
        var listMessage = [];
        try {
                const getMessagesSent = await ChatMessages.find({
                        chatID: chatID,
                        userID: { $ne: userID },
                        messageStatus: { $regex: "sent", $options: "i" }
                }, { roll: 1 });
                await ChatMessages.updateMany({
                        chatID: chatID,
                        userID: { $ne: userID },
                        messageStatus: { $regex: "sent", $options: "i" }
                },
                        {
                                $set:
                                {
                                        messageStatus: "viewed"
                                }
                        });
                for (let index = 0; index < getMessagesSent.length; index++) {
                        const element = getMessagesSent[index];
                        listMessage.push(element.id);
                }
                return listMessage;
        } catch (error) {
                console.log(error.toString());
                return listMessage;
        }
}
exports.updateStatusMessageHttp = async (req, res) => {
        try {
                const getMessagesSent = await ChatMessages.find({
                        chatID: req.body.chatID,
                        userID: { $ne: req.body.userID },
                        messageStatus: { $regex: req.body.messageStatus, $options: "i" }
                }, { roll: 1 });
                const messages = await ChatMessages.updateMany({
                        chatID: req.body.chatID,
                        userID: { $ne: req.body.userID },
                        messageStatus: { $regex: req.body.messageStatus, $options: "i" }
                },
                        {
                                $set:
                                {
                                        messageStatus: "viewed"
                                }
                        });
                if (messages.modifiedCount >= 1) {
                        return res.status(200).json(getMessagesSent);
                }
                else {
                        return res.status(200).json([]);
                }
        } catch (error) {
                return res.status(500).json(error.toString());
        }

}
exports.getMessagesByChatID = async (req, res) => {
        try {
                console.log("check chat id");
                console.log(req.body.chatID);
                const messages = await ChatMessages.find({ chatID: req.body.chatID });
                return res.status(200).json(
                        new BaseResponse(
                                1,
                                Date.now(),
                                messages,
                                new Errors(
                                        200,
                                        "",
                                )
                        )
                );
        } catch (error) {
                return res.status(500).json(
                        new BaseResponse(
                                -1,
                                Date.now(),
                                [],
                                new Errors(
                                        500,
                                        err.toString(),
                                )
                        )
                );
        }

}