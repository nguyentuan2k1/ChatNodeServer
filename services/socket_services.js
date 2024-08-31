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
                                        socket.broadcast.emit("updateUserPresence", {
                                                        "user_id": currentUserId,
                                                        "presence": true,
                                                        "presence_timestamp" : presence.presenceTimeStamp,
                                        });
                                }
                        }
                });

                socket.on('joinRoom', async (data) => {
                        socket.join(data["chatID"]);
                });

                socket.on("leaveRoom", async (data) => {
                        socket.leave(data["chatID"]);
                });

                socket.on('sendMessage', async (data) => {
                        socket.to(data["chatID"]).emit("receiveMessage", data["message"]);
                        // thời gian gửi tin nhắn
                        // ảnh của user gửi
                        // tên người gửi
                        // id user gửi
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

                socket.on('disconnect', async (data) => {
                        console.log("disconect" + socket.id);
                        
                        const userSocket = await UserSocket.findOne({socket_id : socket.id});
                                                
                        if (!userSocket) return;
                        
                        const precense = await Presence.findOne({userID : userSocket.user_id});

                        socket.broadcast.emit("updateUserPresenceDisconnect",
                                {
                                        "user_id": userSocket.user_id,
                                        "presence": false,
                                        "presence_timestamp" : precense.presenceTimeStamp ? precense.presenceTimeStamp : Date.now(),
                                });
                });

                socket.on('reconnect', async(data) => {
                        console.log("reconnect");
                        
                        console.log(socket.id);
                        
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
                                        console.log("updateUserPresence rennect");
                                        
                                        socket.broadcast.emit("updateUserPresence", {
                                                        "user_id": currentUserId,
                                                        "presence": true,
                                                        "presence_timestamp" : presence.presenceTimeStamp,
                                        });
                                }
                        }
                });
        }
}
module.exports = new SocketService(); 