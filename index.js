const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
// const port = process.env.PORT;
const port = 5000;
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
// const UserSocket = require("./models/UserSocket");
// const Message = require("./models/Message");
// const chatController = require("./controllers/chatController");
// const fcmService = require("./fcm/fcmService");
// const Presence = require("./models/Presence");
// const User = require("./models/User");
const messageRouter = require("./routes/message");
// const ChatMessage = require("./models/ChatMessages");
const SocketService = require("./services/socket_services");
dotenv.config();
app.use(express.json());

mongoose
        .connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
        })
        .then(console.log("connected to MongGoDB"))
        .catch((error) => console.log(error));

const io = new Server(server);
global._io = io;
io.on("connection", SocketService.connection);
// io.on("connection", (socket) => {
//         socket.on("LoggedIn", async (data) => {
//                 const presence = await Presence.findOneAndUpdate(
//                         { userID: data["userID"] }, {
//                         $set: {
//                                 presence: true,
//                                 presenceTimeStamp: Date.now()
//                         }
//                 }
//                 );
//                 if (!usersSocketID.get(socket.id)) {
//                         usersSocketID.set(socket.id,
//                                 new UserSocket
//                                         (
//                                                 socket, data["userID"]
//                                         )
//                         );
//                 }
//                 if (usersID.get(data["userID"])) {
//                         const userID = usersID.get(data["userID"]);
//                         // console.log("print userID");
//                         // console.log(userID);
//                         const checkUserIDSocket = userID.socket.find(element => element.id == socket.id);
//                         if (!checkUserIDSocket) {
//                                 userID.socket.push(socket);
//                         }
//                         usersID.delete(data["userID"]);
//                         usersID.set(data["userID"], userID);
//                         // console.log("look for check ");
//                         // console.log(data["userID"]);
//                         usersID.get(data["userID"]);
//                 }
//                 else {
//                         usersID.set(data["userID"],
//                                 new UserSocket
//                                         (
//                                                 [socket], data["userID"]
//                                         )
//                         );
//                 }
//                 if (presence) {
//                         const listChat = await chatController.getChatsIDByUserID(data["userID"]);
//                         const chats = [];
//                         for (let index = 0; index < listChat.length; index++) {
//                                 const element = listChat[index];
//                                 chats.push(element.id);
//                         }
//                         usersRooms.set(data["userID"], chats);
//                         console.log("Rooms");
//                         console.log(usersRooms);
//                         socket.join(chats);
//                         io.to(chats).emit("userOnline", {
//                                 "presence": presence
//                         });
//                 }
//                 // console.log("userID");
//                 // console.log(usersID);
//                 // console.log("userSocketID");
//                 // console.log(usersSocketID);
//         });
//         socket.on("clientSendNewChat", async (data) => {

//         });

//         socket.on("clientSendMessage", async (data) => {
//                 const chatMessage = await new ChatMessage(
//                         {
//                                 chatID: data["chatID"],
//                                 userID: data["userIDSender"],
//                                 message: data["message"],
//                                 urlImageMessage: data["urlImageMessage"],
//                                 urlRecordMessage: data["urlRecordMessage"],
//                                 stampTimeMessage: Date.now(),
//                                 typeMessage: data["typeMessage"],
//                                 messageStatus: data["messageStatus"]
//                         }
//                 ).save();
//                 if (chatMessage) {
//                         const getChat = await chatController.updateMessageChat(data["chatID"], chatMessage);
//                         if (getChat) {
//                                 fcmService.sendNotification(
//                                         data["deviceToken"],
//                                         {
//                                                 'title': data["nameSender"],
//                                                 'body': getChat.lastMessage,
//                                                 'imageUrl': data["urlImageSender"]
//                                         },
//                                         {
//                                                 "chatID": getChat.id,
//                                                 "userIDSender": data["userIDSender"]
//                                         },
//                                         {
//                                                 "priority": "high",
//                                         },
//                                 );
//                                 io.to(getChat.id).emit("serverSendMessage", chatMessage);
//                                 io.to(getChat.id).emit("receivedMessage", {
//                                         "chat": getChat
//                                 });
//                         }
//                 }
//         });
//         socket.on('disconnect', async (data) => {
//                 const userSocket = usersSocketID.get(socket.id);
//                 if (userSocket) {
//                         let options = { returnDocument: 'after' };
//                         const presence = await Presence.findOneAndUpdate(
//                                 { userID: userSocket.userID },
//                                 {
//                                         $set:
//                                         {
//                                                 presence: false,
//                                                 presenceTimeStamp: Date.now()
//                                         }
//                                 },
//                                 options
//                         );
//                         const userID = usersID.get(userSocket.userID);
//                         // console.log("print userID");
//                         // console.log(userID);
//                         if (userID.socket.length > 1) {
//                                 const findIndex = userID.socket.findIndex(element => element.id == socket.id);
//                                 userID.socket.splice(findIndex, 1);
//                                 usersID.delete(userSocket.userID);
//                                 usersID.set(userSocket.userID,
//                                         userID
//                                 );
//                         }
//                         else {
//                                 if (presence) {
//                                         if (usersRooms.get(userSocket.userID)) {
//                                                 console.log("check room disconnected socket");
//                                                 console.log(usersRooms.get(userSocket.userID));
//                                                 io.to(usersRooms.get(userSocket.userID)).emit("userDisconnected", {
//                                                         "presence": presence
//                                                 });
//                                         }
//                                 }
//                                 usersID.delete(userSocket.userID);
//                                 usersRooms.delete(userSocket.userID);
//                         }
//                         usersSocketID.delete(socket.id);
//                 }
//                 console.log(usersID);
//                 console.log(usersSocketID);
//                 console.log(usersRooms);
//         });
// });

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
        res.send("Its working !");
});

server.listen(port, () => {
        console.log(`listening on: *${port}`);
});