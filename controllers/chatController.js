const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const ChatUserAndPresence = require('../models/ChatUserAndPresence');
const User = require('../models/User');
const Paginate     = require('../models/Pagination');

exports.getChat = async (chatID) => {
        return await Chat.findById(chatID);
}

exports.getChatsIDByUserID = async (req, res) => {          
        let listChat = await Chat.find({"users" : {"$in" : req.query.userID}})

        var listChatUserAndPresence = [];

        for (let index = 0; index < listChat.length; index++) {
                const element = listChat[index];
                var findUserFriend;
                if (element.users.length == 2) { // bằng 2 -> chat 1 : 1
                        if (element.users[0] == req.body.userID && element.users[1] == req.body.userID) {
                                findUserFriend = req.body.userID;
                        }
                        else {
                                findUserFriend = element.users.find((element) => element != req.body.userID);
                        }
                } else { // chat > 2

                }

                const userFriend = await User.findById(findUserFriend);
                
                listChatUserAndPresence.push({name : userFriend.name, urlImage : userFriend.urlImage , presence : true, users : element.users, lastMessage : element.lastMessage, typeMessage : element.typeMessage, timeLastMessage : element.timeLastMessage});
        }

        const { total, totalPages, paginated} = Paginate.paginate(listChatUserAndPresence, req.query.page ?? 1, req.query.pageSize ?? 15);
            
        return BaseResponse.customResponse(res, "", 1, 200, {
            currentPage: req.query.page ?? 1,
            totalPages: totalPages,
            total: total,
            pageSize: req.query.pageSize ?? 15,
            data: paginated
        });


        // return BaseResponse.customResponse(res, "", 1, 200, )
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