const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
        users: {
                type: Array,
                required: true,
        },
        lastMessage: {
                type: String,
                required: true,
        },
        userIDLastMessage:{
                type:String,
                required:true,
                default: ""
        },
        timeLastMessage:{
                type: Date,
                required: true, 
        },
        active: {
                type: Boolean,
                default: false, 
        },
        typeMessage: {
                type:String,
                required:true,
                default: "text"
        },
}, { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);