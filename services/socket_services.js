const UserSocket = require("../models/UserSocket");
const chatController = require("../controllers/chatController");
const fcmService = require("../fcm/fcmService");
const Presence = require("../models/Presence");
const ChatMessage = require("../models/ChatMessages");
const chatMessagesController = require("../controllers/chatMessagesController");
class SocketService {
        connection(socket) {
                socket.on("LoggedIn", async (data) => {
                        const presence = await Presence.findOneAndUpdate(
                                { userID: data["userID"] }, {
                                $set: {
                                        presence: true,
                                        presenceTimeStamp: Date.now()
                                }
                        }
                        );
                        if (!usersSocketID.get(socket.id)) {
                                usersSocketID.set(socket.id,
                                        new UserSocket
                                                (
                                                        socket, data["userID"]
                                                )
                                );
                        }
                        if (usersID.get(data["userID"])) {
                                const userID = usersID.get(data["userID"]);
                                console.log("print userID");
                                console.log(userID);
                                const checkUserIDSocket = userID.socket.find(element => element.id == socket.id);
                                if (!checkUserIDSocket) {
                                        userID.socket.push(socket);
                                }
                                usersID.delete(data["userID"]);
                                usersID.set(data["userID"], userID);
                                console.log("look for check ");
                                console.log(data["userID"]);
                                usersID.get(data["userID"]);
                        }
                        else {
                                usersID.set(data["userID"],
                                        new UserSocket
                                                (
                                                        [socket], data["userID"]
                                                )
                                );
                        }
                        if (presence) {
                                const listChat = await chatController.getChatsIDByUserID(data["userID"]);
                                const chats = [];
                                for (let index = 0; index < listChat.length; index++) {
                                        const element = listChat[index];
                                        chats.push(element.id);
                                }
                                usersRooms.set(data["userID"], chats);
                                console.log("Rooms");
                                console.log(usersRooms);
                                socket.join(chats);
                                _io.to(chats).emit("userOnline", {
                                        "presence": presence
                                });
                        }
                        console.log("userID");
                        console.log(usersID);
                        console.log("userSocketID");
                        console.log(usersSocketID);
                });
                socket.on("sendActiveChat", async (data) => {
                        console.log("sendActiveChat");
                        console.log(data["chatID"]);
                        await chatController.updateActiveChat(data["chatID"]);
                        _io.to(data["chatID"]).emit("receiveActiveChat",
                                {
                                        "chatID": data["chatID"]
                                });
                });
                socket.on("updateSentMessages", async (data) =>{
                        console.log("updateSentMessages");
                        console.log(data["chatID"]);
                        console.log(data["userID"]);
                        const messages = await chatMessagesController.updateStatusSentMessage(data["chatID"],data["userID"]);
                        _io.to(data["chatID"]).emit("receiveMessagesUpdated",{
                                "ListIDMessage":messages
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
                        const userSocket = usersSocketID.get(socket.id);
                        if (userSocket) {
                                let options = { returnDocument: 'after' };
                                const presence = await Presence.findOneAndUpdate(
                                        { userID: userSocket.userID },
                                        {
                                                $set:
                                                {
                                                        presence: false,
                                                        presenceTimeStamp: Date.now()
                                                }
                                        },
                                        options
                                );
                                const userID = usersID.get(userSocket.userID);
                                console.log("print userID");
                                console.log(userID);
                                if (userID.socket.length > 1) {
                                        const findIndex = userID.socket.findIndex(element => element.id == socket.id);
                                        userID.socket.splice(findIndex, 1);
                                        usersID.delete(userSocket.userID);
                                        usersID.set(userSocket.userID,
                                                userID
                                        );
                                }
                                else {
                                        if (presence) {
                                                if (usersRooms.get(userSocket.userID)) {
                                                        console.log("check room disconnected socket");
                                                        console.log(usersRooms.get(userSocket.userID));
                                                        _io.to(usersRooms.get(userSocket.userID)).emit("userDisconnected", {
                                                                "presence": presence
                                                        });
                                                }
                                        }
                                        usersID.delete(userSocket.userID);
                                        usersRooms.delete(userSocket.userID);
                                }
                                usersSocketID.delete(socket.id);
                        }
                        console.log(usersID);
                        console.log(usersSocketID);
                        console.log(usersRooms);
                });
        }
}
module.exports = new SocketService(); 