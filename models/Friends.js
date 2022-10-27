const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema({
        userID:{
                type:Array,
                required: true,
                unique:true,
        },
        typeFriend:{
                type:String,
                required: true,
                default:"single"
        },
        nameChat:{
                type:String,
                required:true,
        }
});

module.exports = mongoose.model("Friends", FriendsSchema);