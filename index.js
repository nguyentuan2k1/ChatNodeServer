const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
// const port = process.env.PORT;
const port = 5000;
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const messageRouter = require("./routes/message");
const UserSocket = require("./models/UserSocket");
const Message = require("./models/Message");
const chatController = require("./controllers/chatController");
const socketController = require("./controllers/socketController");
dotenv.config();

const { Server } = require("socket.io");
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
                console.log("userID");
                console.log(usersID);
                console.log("userSocketID");
                console.log(usersSocketID);
        });
        socket.on("JoinChat", (data) => {
                console.log("check socket user");
                console.log(usersSocketID.get(socket.id).socket);
                usersSocketID.get(socket.id).socket.join(data["chatID"]);
                console.log("join chat" + data["chatID"]);
        });
        socket.on("LeaveChat", (data) => {
                usersSocketID.get(socket.id).socket.leave(data["chatID"]);
                console.log("leave chat " + data["chatID"]);
        });
        socket.on("clientSendMessage", async (data) => {
                console.log(data);
                const message = new Message(
                        data["userID"],
                        data["message"],
                        data["urlImageMessage"],
                        data["urlRecordMessage"],
                        new Date(Date.now()),
                        data["typeMessage"],
                        data["messageStatus"],
                );
                const getChat = await chatController.updateMessageChat(data["chatID"], message);
                if (getChat) {
                        io.to(getChat.id).emit("serverSendMessage", data);
                        const users = getChat.users;
                        console.log(users);
                        if (users[0] == users[1]) {
                                const listSocket = usersID.get(users[0]).socket;
                                for (let index = 0; index < listSocket.length; index++) {
                                        const element = listSocket[index];
                                        console.log("newchat");
                                        console.log(getChat);
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

app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
        res.send("Its working !");
});

server.listen(port, () => {
        console.log(`listening on: *${port}`);
});