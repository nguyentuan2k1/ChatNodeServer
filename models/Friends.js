const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema({
        userID:{
                type:String,
                required: true,
                unique:true,
        },
        nameChat:{
                type:String,
                required:true,
        }
});

module.exports = mongoose.model("Friends", FriendsSchema);