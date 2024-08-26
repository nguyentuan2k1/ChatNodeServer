const mongoose = require("mongoose");

const UserSocket = new mongoose.Schema({
        socket_id: {
                type: String,
                required: true,
        },
        user_id: {
                type: String,
                required: true,
        },
        time_stamp:{
                type:Date,
                required:true,
                default:Date.now(),
        }
}, { timeStamp: true }
);

module.exports = mongoose.model("usersockets", UserSocket);