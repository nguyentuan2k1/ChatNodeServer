const Chat = require("../models/Chat");
const BaseResponse = require('../models/BaseResponse');
const User = require('../models/User');
const Paginate     = require('../models/Pagination');
const helper = require('../services/helper')


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
                if (element.users.length == 2) { // bằng 2 -> chat 1 : 1
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
                } else { // chat > 2

                }

                const userFriend = await User.findById(findUserFriend);
                
                listChatUserAndPresence.push({name : userFriend.name, urlImage : userFriend.urlImage , presence : true, users : element.users, lastMessage : element.lastMessage, typeMessage : element.typeMessage, timeLastMessage : element.timeLastMessage});
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