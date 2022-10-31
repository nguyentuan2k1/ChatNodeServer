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
const messageRouter = require("./routes/message");
const UserSocket = require("./models/UserSocket");
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

var usersSocket = [];
io.on("connection", (socket) => {
        socket.on("LoggedIn", async (data) => {
                usersSocket.push(
                        new UserSocket
                                (
                                        socket.id, data["userID"]
                                )
                );
                console.log(usersSocket);
        });
        socket.on("JoinChat", (data) => {
                const getSocketByUserID = socketController.findUserByUserID(usersSocket, data["userID"]);
                if (getSocketByUserID != null) {
                        io.sockets.sockets.get(getSocketByUserID.socketID).join(data["chatID"]);
                        console.log("join chat" + data["chatID"]);
                }
        });
        socket.on("LeaveChat", (data) => {
                const getSocketByUserID = socketController.findUserByUserID(usersSocket, data["userID"]);
                if (getSocketByUserID != null) {
                        io.sockets.sockets.get(getSocketByUserID.socketID).leave(data["chatID"]);
                        console.log("leave chat " + data["chatID"]);
                }
        });
        socket.on("clientSendMessage", async (data) => {
                console.log(data);
                io.to(data["chatID"]).emit("serverSendMessage", data);
        });
        socket.on('disconnect', async (data) => {       
                const index = socketController.findIndexBySocketID(usersSocket, socket.id);
                if (index >= 0) {
                        usersSocket.splice(index, 1);
                }
                console.log(usersSocket.length);
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