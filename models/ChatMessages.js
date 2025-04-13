const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


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

ChatMessagesSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ChatMessages", ChatMessagesSchema);