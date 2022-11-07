const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
const port = process.env.PORT;
// const port = 5000;
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
// const messageRouter = require("./routes/message");
const UserSocket = require("./models/UserSocket");
const Message = require("./models/Message");
const chatController = require("./controllers/chatController");
const socketController = require("./controllers/socketController");
const fcmService = require("./fcm/fcmService");
const { Server } = require("socket.io");
const Presence = require("./models/Presence");
const User = require("./models/User");
const utilsDateTime = require("./utils/utilsDateTime");
const ChatUserAndPresence = require("./models/ChatUserAndPresence");
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

var usersSocketID = new Map();
var usersID = new Map();
io.on("connection", (socket) => {
        socket.on("LoggedIn", async (data) => {
                const presence = await Presence.findOne(
                        { userID: data["userID"] }
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
                        socket.broadcast.emit("userOnline", {
                                "presence": presence
                        });

                }
                console.log("userID");
                console.log(usersID);
                console.log("userSocketID");
                console.log(usersSocketID);
        });
        socket.on("JoinChat", (data) => {
                console.log("check socket user");
                if (usersSocketID.get(socket.id)) {
                        console.log(usersSocketID.get(socket.id).socket);
                        usersSocketID.get(socket.id).socket.join(data["chatID"]);
                        console.log("join chat" + data["chatID"]);
                }
        });
        socket.on("clientSendNewChat", async (data) => {
                var chatUser = data["chatUserAndPresence"];
                console.log("check users");
                console.log(data["usersChat"].toString());
                console.log("check new chat");
                console.log(data["chatUserAndPresence"]);
                const usersChat = data["usersChat"];
                if (usersChat[0] == usersChat[1]) {
                        if (usersID.get(data["userIDFriend"])) {
                                const userID = usersID.get(usersChat[0]);
                                const presence = await Presence.findOne({ userID: userID.userID });
                                const user = await User.findById(userID.userID);
                                chatUser.presence = presence;
                                chatUser.user = user;
                                const listSocket = userID.socket;
                                for (let index = 0; index < listSocket.length; index++) {
                                        const element = listSocket[index];
                                        element.emit("receivedNewChat", {
                                                "chatUserAndPresence": chatUser
                                        });
                                }
                        }
                }
                else {
                        for (let index = 0; index < usersChat.length; index++) {
                                const element = usersChat[index];
                                if (usersID.get(element)) {
                                        const userID = usersID.get(element);
                                        const otherUserID = usersChat.find(e => e != element);
                                        const presence = await Presence.findOne({ userID: otherUserID });
                                        const user = await User.findById(otherUserID);
                                        chatUser.presence = presence;
                                        chatUser.user = user;
                                        console.log("check get User");
                                        console.log(chatUser.user);
                                        console.log(index.toString());
                                        console.log(userID);
                                        const listSocket = userID.socket;
                                        for (let i = 0; i < listSocket.length; i++) {
                                                const socket = listSocket[i];
                                                console.log(i.toString());
                                                console.log(socket);
                                                socket.emit("receivedNewChat", {
                                                        "chatUserAndPresence": chatUser
                                                });
                                        }
                                }
                        }
                }
        });
        socket.on("LeaveChat", (data) => {
                if (usersSocketID.get(socket.id)) {
                        usersSocketID.get(socket.id).socket.leave(data["chatID"]);
                        console.log("leave chat " + data["chatID"]);

                }
        });
        socket.on("clientSendMessage", async (data) => {
                const message = new Message(
                        data["userID"],
                        data["message"],
                        data["urlImageMessage"],
                        data["urlRecordMessage"],
                        new Date(Date.now()),
                        data["typeMessage"],
                        data["messageStatus"],
                );
                console.log("senderID");
                console.log(data["userIDSender"]);
                const getChat = await chatController.updateMessageChat(data["chatID"], message);
                if (getChat) {
                        console.log("check device Token");
                        console.log(data["deviceToken"]);
                        fcmService.sendNotification(
                                data["deviceToken"],
                                {
                                        'title': data["nameSender"],
                                        'body': getChat.lastMessage,
                                },
                                {
                                        "urlImageSender": data["urlImageSender"],
                                        "message": getChat.lastMessage,
                                        "chatID": getChat.id,
                                        "userIDSender": data["userIDSender"]
                                }
                        );
                        io.to(getChat.id).emit("serverSendMessage", message);
                        const users = getChat.users;
                        console.log(users);
                        if (users[0] == users[1]) {
                                const listSocket = usersID.get(users[0]).socket;
                                for (let index = 0; index < listSocket.length; index++) {
                                        const element = listSocket[index];
                                        // console.log("newchat");
                                        // console.log(getChat);
                                        element.emit("receivedMessage", {
                                                "chat": getChat,
                                        }
                                        );
                                }
                        }
                        else {
                                for (let index = 0; index < users.length; index++) {
                                        const element = users[index];
                                        console.log(index + " " + element);
                                        if (usersID.get(element)) {
                                                const listSocket = usersID.get(element).socket;
                                                for (let j = 0; j < listSocket.length; j++) {
                                                        const element = listSocket[j];
                                                        element.emit("receivedMessage", {
                                                                "chat": getChat,
                                                        });
                                                }
                                        }
                                }
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
                                        io.emit("userDisconnected", {
                                                "presence": presence
                                        });
                                }
                                usersID.delete(userSocket.userID);
                        }
                        usersSocketID.delete(socket.id);
                }
                console.log(usersID);
                console.log(usersSocketID);
        });

});

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);
// app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
        res.send("Its working !");
});

server.listen(port, () => {
        console.log(`listening on: *${port}`);
});