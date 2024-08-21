const { default: mongoose, now } = require('mongoose');
const BaseResponse = require('../models/BaseResponse');
const Friends = require('../models/Friends');
let options = { returnDocument: 'after' }
const dotenv = require("dotenv");
const User = require('../models/User');
const helper = require('../services/helper')
const Paginate     = require('../models/Pagination');
const Chat = require('../models/Chat');

dotenv.config();

exports.getFriends = async (req, res) => {
    try {
        let userId = await helper.getInfoCurrentUser(req, res);

        const { keyword, page, pageSize } = req.query;

        let queryConditions = {};

        if (keyword) {
            queryConditions.$or = [
                { name: new RegExp(keyword, 'i') },
            ];
        }

        const getFriends = await Paginate.paginate(Friends.find({ userID: userId }), Friends.find({ userID: userId }), page, pageSize);
        
        const friendIds = getFriends.data.map(item => item.friendId);

        let userQuery = User.find({ _id: { $in: friendIds } });

        if (keyword) userQuery = userQuery.where(queryConditions);

        let listFriend = await userQuery.exec();
        
        listFriend = listFriend.map(item => ({
            name: item.name,
            urlImage: item.urlImage ? item.urlImage : "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg",
            presence : true,
        }));
        

        const {currentPage, total, totalPages} = getFriends;

        return BaseResponse.customResponse(res, "", 1, 200, {
            currentPage,
            pageSize : parseInt(pageSize),
            total,
            totalPages,
            data : listFriend
        });
    } catch (e) {
        return BaseResponse.customResponse(res, e.toString(), 0, 500);
    }
}

exports.addFriend = async (req, res) => {
    try {
        let userId      = await helper.getInfoCurrentUser(req, res);
        let {friend_id} = req.body;
        const query     = { userID: userId, friendId: friend_id }; 
        const update    = { $setOnInsert: { userID: userId, friendId: friend_id } };

        await Friends.findOneAndUpdate(query, update, { new: true, upsert: true });

        let chat = await Chat.findOne({
            users: { $all: [userId, friend_id] }
        });
        
        if (!chat) {
            chat = new Chat({
                users: [userId, friend_id],
                lastMessage: " ", 
                userIDLastMessage: userId, 
                timeLastMessage: now(), 
                active: true,
                typeMessage : "text",
                newChat : true,
            });
        
            await chat.save();
        }

        return BaseResponse.customResponse(res, "Add Friend successfully", 1, 200);
    } catch (e) {
        return BaseResponse.customResponse(res, e.toString(), 0, 500);
    }
}
