class Message {
        constructor(userID, message, urlImageMessage, urlRecordMessage, stampTimeMessage, typeMessage, messageStatus) {
                this.userID = userID;
                this.message = message;
                this.urlImageMessage = urlImageMessage;
                this.urlRecordMessage = urlRecordMessage;
                this.stampTimeMessage = stampTimeMessage;
                this.typeMessage = typeMessage;
                this.messageStatus = messageStatus;
        }
}
// const MessageSchema = new mongoose.Schema({
//         userID: {
//                 type: String,
//                 required: true,
//         },
//         message: {
//                 type: String,
//                 required: true,
//                 default: ""
//         },
//         urlImageMessage: {
//                 type: String,
//                 required: true,
//                 default: ""
//         },
//         urlRecordMessage: {
//                 type: String,
//                 required: true,
//                 default: ""
//         },
//         stampTimeMessage: {
//                 type: Date,
//                 required: true,
//                 default: Date.now()
//         },
//         typeMessage: {
//                 type: String,
//                 required: true,
//                 default: "text",
//         },
//         messageStatus: {
//                 type: String,
//                 required: true,
//                 default: "Sent"
//         }
// }, { timestamps: true }
// );

// module.exports = mongoose.model("Message", MessageSchema);
module.exports = Message;