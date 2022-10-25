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

io.on("connection", (socket) => {
        
});

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
        res.send("Its working !");
});

server.listen(port, () => {
        console.log(`listening on: *${port}`);
});