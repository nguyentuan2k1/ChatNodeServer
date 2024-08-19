const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const ChatMessages = require("../models/ChatMessages");
const Paginate     = require('../models/Pagination');
const Joi = require('joi');

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
                let schema = Joi.object({
                        chatID: Joi.string().required(),
                });

                const {error, validate} = schema.validate({ chatID: req.body.chatID ?? ""});                

                if (error) return BaseResponse.customResponse(res, error.message, 0, 400); 

                const { chatID, page = 1, pageSize = 10 } = req.body;

                const sort = { _id: -1 };
            
                const allMessages = await ChatMessages.find({ chatID }).sort(sort);
                const { total, totalPages, paginated} = Paginate.paginate(allMessages, page, pageSize);
            
                return BaseResponse.customResponse(res, "", 1, 200, {
                    currentPage: page,
                    totalPages: totalPages,
                    total: total,
                    pageSize: pageSize,
                    data: paginated
                });
        } catch (error) {
                return BaseResponse.customResponse(res, err.toString(), 0, 500);
        }

}