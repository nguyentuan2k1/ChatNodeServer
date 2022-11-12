const mongoose = require('mongoose');

const ChatMessagesSchema = new mongoose.Schema({
        chatID: {
                type: String,
                required: true
        },
        userID: {
                type: String,
                required: true,
        },
        message: {
                type: String,
                required: true,
                default: ""
        },
        urlImageMessage: {
                type: Array,
                required: true,
                default: ""
        },
        urlRecordMessage: {
                type: String,
                default: ""
        },
        stampTimeMessage: {
                type: Date,
                required: true,
                default: Date.now()
        },
        typeMessage: {
                type: String,
                required: true,
                default: "text",
        },
        messageStatus: {
                type: String,
                required: true,
                default: "Sent"
        }
}, { collection: "ChatMessages", timestamps: true }
);

module.exports = mongoose.model("ChatMessages", ChatMessagesSchema);