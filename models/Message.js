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

module.exports = Message;