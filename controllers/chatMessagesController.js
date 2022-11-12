const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const ChatMessages = require("../models/ChatMessages");

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