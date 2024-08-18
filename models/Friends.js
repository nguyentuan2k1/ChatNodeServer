const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema({
        userID:{
                type: String,
                required: true,
        },
        friendId : {
                type: String,
                required: true,
        }
});

module.exports = mongoose.model("Friends", FriendsSchema);