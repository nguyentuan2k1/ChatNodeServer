const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const ChatMessages = require("../models/ChatMessages");
const Paginate     = require('../models/Pagination');
const Joi = require('joi');
const helper = require('../services/helper');
const User = require('../models/User');

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
exports.takeMessagesByChatID = async (req, res) => {
        try {
                let schema = Joi.object({
                        chatID: Joi.string().required(),
                });

                const { chatID, page = 1, pageSize = 10 } = req.body;

                const { error } = schema.validate({ chatID: chatID ?? "" });                

                if (error) return BaseResponse.customResponse(res, error.message, 0, 400); 

                const sort = { stampTimeMessage: -1 };  // Changed from 1 to -1 for descending order
        
                let data = await Paginate.paginate(
                        ChatMessages.find({ chatID: chatID }).sort(sort),
                        ChatMessages.find({ chatID: chatID }).sort(sort),
                        page,
                        pageSize
                );

                const userID = await helper.getInfoCurrentUser(req, res);

                data.data = await Promise.all(data.data.map(async item => {
                        const user = await User.findById(item.userID);
                        let urlImage = "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg";

                        if (user) {
                                urlImage = user.urlImage ? user.urlImage : urlImage;
                        }

                        return {
                                _id: item._id,
                                userID: item.userID,
                                message: item.message,
                                stampTimeMessage: item.stampTimeMessage,
                                typeMessage: item.typeMessage,
                                messageStatus: item.messageStatus,
                                avatar: urlImage,
                                isMine: item.userID === userID
                        };
                }));

                return BaseResponse.customResponse(res, "", 1, 200, data);
        } catch (error) {
                return BaseResponse.customResponse(res, error.toString(), 0, 500);
        }

}