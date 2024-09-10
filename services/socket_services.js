const chatController = require("../controllers/chatController");
const fcmService = require("../fcm/fcmService");
const Presence = require("../models/Presence");
const ChatMessage = require("../models/ChatMessages");
const chatMessagesController = require("../controllers/chatMessagesController");
let options = { returnDocument: 'after' };
const UserSocket = require("../models/UserSocket");
const helper = require('../services/helper');
const ChatMessages = require("../models/ChatMessages");

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
                socket.on("updateMessageStatus", async (data) => {
                  const chatID = data["chatID"];
                  const messageID = data["messageID"];
                  const statusMessage = data["statusMessage"];

                  const chatMessage = await ChatMessage.findOneAndUpdate(
                    { id: messageID },
                    { $set: { messageStatus: statusMessage } },
                    options
                  );

                  if (chatMessage) {
                    socket.to(chatID).emit("updateMessageStatus", {
                      idMessage: messageID,
                      statusMessage: statusMessage,
                    });
                  }
                });
                socket.on("clientSendMessage", async (data) => {
                        let chatMessage = await new ChatMessage(
                                {
                                        chatID: data["chatID"],
                                        userID: data["userID"],
                                        message: data["message"],
                                        urlImageMessage: data["urlImageMessage"],
                                        urlRecordMessage: data["urlRecordMessage"],
                                        stampTimeMessage: Date.now(),
                                        typeMessage: data["typeMessage"],
                                        messageStatus: "sent"
                                }
                        ).save();
                        if (chatMessage) {
                                chatMessage = chatMessage.toObject();
                                chatMessage.uuid = data["uuid"];
                                chatMessage.avatar = data["avatar"];
                                chatMessage.nameSender = data["nameSender"];
                                chatMessage.isMine = false;
                                const getChat = await chatController.updateMessageChat(data["chatID"], chatMessage);
                                if (getChat) {
                                        // const listUser = getChat.users.filter(user => user._id != data["userIDSender"]);

                                        // let usersDeviceToken = await User.find({ _id: { $in: listUser } }).select('deviceToken');

                                        // await fcmService.sendMultipleNotification(
                                        //         usersDeviceToken,
                                        //         data["nameSender"],
                                        //         data["message"],
                                        //         {
                                        //           event: "new_message",
                                        //           data: JSON.stringify({
                                        //            imageUrl: data["urlImageSender"],
                                        //            chat: JSON.stringify(getChat),
                                        //            userIDSender: data["userIDSender"]
                                        //           }),
                                        //         }
                                        //       );

                                        
                                        socket.to(data["chatID"]).emit("newMessage", chatMessage);
                                        
                                        socket.emit("updateSentMessages", {
                                             "idMessage": chatMessage.id,
                                             "uuid" : chatMessage.uuid,
                                             "statusMessage": chatMessage.messageStatus
                                        });
                                }
                        }
                });
                socket.on("updateReadMessages", async (data) => {
                  const chatID = data["chatID"];

                  const result = await ChatMessages.updateMany(
                     { chatID: chatID, messageStatus: "sent" },
                     {
                       $set: { messageStatus: "read" },
                     }
                  );
                

                  if (result) {     
                    socket.to(chatID).emit("userReadMessages", {
                        "chatID" : chatID,
                    });
                  }                  
                });
                socket.on("user-typing", async (data) => {
                        console.log("user-typing: ");
                        console.log(data)
                        const chatID = data["chatID"];

                        socket.to(chatID).emit("update-user-typing", {
                          chatID: chatID,
                          userID: data["userID"],
                          senderAvatar: data["senderAvatar"],
                          senderName: data["senderName"],
                        });
                });
                socket.on("user-stop-typing", async (data) => {
                        console.log("user-stop-typing: ");
                        console.log(data);
                        const chatID = data["chatID"];

                        socket.to(chatID).emit("update-user-stop-typing", {
                                chatID: chatID,
                                userID: data["userID"],
                                senderAvatar: data["senderAvatar"],
                                senderName: data["senderName"],
                        });
                });
                socket.on('disconnect', async (data) => {
                        console.log("disconect: " + socket.id);
                        
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
                        console.log("reconnect: " + socket.id);
                        
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
                                        console.log("old socketid: " + userSocket.socket_id);
                                        console.log("new socketid: " + socket.id);

                                        const rooms =
                                            _io.of("/").adapter.rooms;

                                        const sids = _io.of("/").adapter.sids;

                                        rooms.forEach((_, roomId) => {
                                            console.log("roomId: " + roomId);
                                            if (
                                              !sids
                                                .get(userSocket.socket_id)
                                                ?.has(roomId)
                                            ) {
                                              console.log(
                                                `User ${currentUserId} with socket ${socket.id} joined room ${roomId}`
                                              );
                                              socket.join(roomId);
                                            }
                                          });

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