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
        timeLastMessage:{
                type: Date,
                required: true, 
        },
        active: {
                type: Boolean,
                default: false, 
        },
        messages:{
                type: Array,
                default: [],
        }
}, { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);