const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
        users: {
                type: Array,
                required: true,
        },
        lastMessage: {
                type: String,
        },
        userIDLastMessage:{
                type:String,
        },
        timeLastMessage:{
                type: Date,
                required: true, 
        },
        type: {
                type: String,
                required: true,
        }
}, { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);