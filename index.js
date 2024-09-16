const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
const port = process.env.PORT || 5000;
// const port = process.env.PORT;
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const friendRouter = require("./routes/friend");
const messageRouter = require("./routes/message");
const chatRouter = require("./routes/chat");
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

app.use('/uploads', express.static('uploads'));

global._io = io;
global.dotenv = dotenv;
global.dotenv.config();

io.on("connection", SocketService.connection);

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.use("/api/message", messageRouter);

app.use("/api/chat", chatRouter);

app.use("/api/friend", friendRouter);

app.get("/", (req, res) => {
  res.send("Its working !");
});

server.listen(port, () => {
  console.log(`listening on: *${port}`);
});