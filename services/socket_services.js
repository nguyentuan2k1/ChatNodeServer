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
                                        messageStatus: "sent"
                                }
                        ).save();
                        if (chatMessage) {
                                const getChat = await chatController.updateMessageChat(data["chatID"], chatMessage);
                                if (getChat) {
                                        const listUser = getChat.users.filter(user => user._id != data["userIDSender"]);

                                        let usersDeviceToken = await User.find({ _id: { $in: listUser } }).select('deviceToken');

                                        await fcmService.sendMultipleNotification(
                                                usersDeviceToken,
                                                data["nameSender"],
                                                data["message"],
                                                {
                                                  event: "new_message",
                                                  data: JSON.stringify({
                                                   imageUrl: data["urlImageSender"],
                                                   chat: getChat,
                                                   userIDSender: data["userIDSender"]
                                                  }),
                                                }
                                              );

                                        chatMessage.user_image = data["urlImageSender"];
                                        chatMessage.user_name  = data["nameSender"];
                                        chatMessage.isMine     = false;

                                        socket.to(data["chatID"]).emit("newMessage", chatMessage);

                                        socket.emit("updateSentMessages", {
                                             "idMessage": chatMessage.id,
                                             "statusMessage": chatMessage.messageStatus
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