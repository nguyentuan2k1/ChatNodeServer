const chatController = require("../controllers/chatController");
const fcmService = require("../fcm/fcmService");
const Presence = require("../models/Presence");
const ChatMessage = require("../models/ChatMessages");
const chatMessagesController = require("../controllers/chatMessagesController");
let options = { returnDocument: 'after' };
const UserSocket = require("../models/UserSocket");
const helper = require('../services/helper')

class SocketService {
        connection(socket) {
                socket.on("LoggedIn", async (data) => {
                        console.log("đã log vào LoggedIn - 13");
                        
                        let token           = data['access_token'];                                           
                        const currentUserId = await helper.getCurrentUserIdByToken(token);                        
                        
                        if (currentUserId) {
                                const presence = await Presence.findOneAndUpdate(
                                        { userID: currentUserId }, {
                                        $set: {
                                                presence: true,
                                                presenceTimeStamp: Date.now()
                                        }
                                }, options);
                                
                                let userSocket = await UserSocket.findOne(
                                        { user_id: currentUserId },
                                );

                                if (userSocket) {
                                        userSocket.socket_id = socket.id;
                                        userSocket.save();
                                } else {
                                        userSocket = await UserSocket.create({
                                                user_id: currentUserId,
                                                socket_id: socket.id
                                        });
                                }

                                if (presence) {
                                        _io.emit('updateUserPresence', {
                                                user_id: currentUserId,
                                                presence: true,
                                        });
                                }
                        }
                });
                socket.on("sendActiveChat", async (data) => {
                        console.log("sendActiveChat");
                        console.log(data["chatID"]);
                        const chat = await chatController.updateActiveChat(data["chatID"]);
                        if (chat) {
                                _io.to(data["chatID"]).emit("receiveActiveChat",
                                        {
                                                "chatID": data["chatID"]
                                        });

                        }
                });
                socket.on("updateSentMessages", async (data) => {
                        console.log("updateSentMessages");
                        console.log(data["chatID"]);
                        console.log(data["userID"]);
                        const messages = await chatMessagesController.updateStatusSentMessage(data["chatID"], data["userID"]);
                        _io.to(data["chatID"]).emit("receiveMessagesUpdated", {
                                "ListIDMessage": messages
                        });
                });
                socket.on("clientSendMessage", async (data) => {
                        const chatMessage = await new ChatMessage(
                                {
                                        chatID: data["chatID"],
                                        userID: data["userIDSender"],
                                        message: data["message"],
                                        urlImageMessage: data["urlImageMessage"],
                                        urlRecordMessage: data["urlRecordMessage"],
                                        stampTimeMessage: Date.now(),
                                        typeMessage: data["typeMessage"],
                                        messageStatus: data["messageStatus"]
                                }
                        ).save();
                        if (chatMessage) {
                                const getChat = await chatController.updateMessageChat(data["chatID"], chatMessage);
                                if (getChat) {
                                        fcmService.sendNotification(
                                                data["deviceToken"],
                                                {
                                                        'title': data["nameSender"],
                                                        'body': getChat.lastMessage,
                                                        'imageUrl': data["urlImageSender"]
                                                },
                                                {
                                                        "chatID": getChat.id,
                                                        "userIDSender": data["userIDSender"]
                                                },
                                                {
                                                        "priority": "high",
                                                },
                                        );
                                        _io.to(getChat.id).emit("serverSendMessage", chatMessage);
                                        _io.to(getChat.id).emit("receivedMessage", {
                                                "chat": getChat
                                        });
                                }
                        }
                });
                // socket.on('disconnect', async (data) => {
                //         const userSocket = usersSocketID.get(socket.id);
                //         if (userSocket) {
                //                 let options = { returnDocument: 'after' };
                //                 const presence = await Presence.findOneAndUpdate(
                //                         { userID: userSocket.userID },
                //                         {
                //                                 $set:
                //                                 {
                //                                         presence: false,
                //                                         presenceTimeStamp: Date.now()
                //                                 }
                //                         },
                //                         options
                //                 );
                //                 const userID = usersID.get(userSocket.userID);
                //                 console.log("print userID");
                //                 console.log(userID);
                //                 if (userID.socket.length > 1) {
                //                         const findIndex = userID.socket.findIndex(element => element.id == socket.id);
                //                         userID.socket.splice(findIndex, 1);
                //                         usersID.delete(userSocket.userID);
                //                         usersID.set(userSocket.userID,
                //                                 userID
                //                         );
                //                 }
                //                 else {
                //                         if (presence) {
                //                                 if (usersRooms.get(userSocket.userID)) {
                //                                         console.log("check room disconnected socket");
                //                                         console.log(usersRooms.get(userSocket.userID));
                //                                         _io.to(usersRooms.get(userSocket.userID)).emit("userDisconnected", {
                //                                                 "presence": presence
                //                                         });
                //                                 }
                //                         }
                //                         usersID.delete(userSocket.userID);
                //                         usersRooms.delete(userSocket.userID);
                //                 }
                //                 usersSocketID.delete(socket.id);
                //         }
                //         console.log(usersID);
                //         console.log(usersSocketID);
                //         console.log(usersRooms);
                // });
        }
}
module.exports = new SocketService(); 