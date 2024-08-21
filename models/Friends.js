const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema({
        userID:{
                type: String,
                required: true,
        },
        friendId : {
                type: String,
                required: true,
        },
        status : {
                type: Number,
                enum: [1, 2, 3, 4, 5],     
                // 1 chưa thêm
                // 2 gửi yêu cầu 
                // 3 đã thêm
                // 4 đợi duyệt 
                // 5 chặn 
        }
});

module.exports = mongoose.model("Friends", FriendsSchema);