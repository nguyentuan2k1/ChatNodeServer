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
        },
        urlImage: {
                type: String,
                default: "",
        },
        nameChat: {
                Stype: String,
                default: "",
        }, 
        typeLastMessage: {
                type: String,
                default: "text",
        }
}, { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);