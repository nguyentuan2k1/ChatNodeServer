const { default: mongoose, now } = require('mongoose');
const BaseResponse = require('../models/BaseResponse');
const Friends = require('../models/Friends');
let options = { returnDocument: 'after' }
const dotenv = require("dotenv");
const User = require('../models/User');
const helper = require('../services/helper')
const Paginate     = require('../models/Pagination');
const Chat = require('../models/Chat');
const fcmService = require('../fcm/fcmService');

dotenv.config();

exports.getFriends = async (req, res) => {
    try {        
        let userId = await helper.getInfoCurrentUser(req, res);

        const { keyword, page = 1, pageSize = 15, exceptFriendIds } = req.query;

        let queryConditions = {};

        if (keyword) {
            queryConditions.$or = [
                { name: new RegExp(keyword, 'i') },
            ];
        }

        if (exceptFriendIds) {
            const exceptFriendIdsArray = exceptFriendIds.split(',');            
            queryConditions.friendId = { $nin: exceptFriendIdsArray };
        }

        queryConditions.status = { $eq: 3 };

        const getFriends = await Paginate.paginate(Friends.find({ userID: userId, ...queryConditions }), Friends.find({ userID: userId, ...queryConditions }), page, pageSize);
        
        const friendIds = getFriends.data.map(item => item.friendId);

        let userQuery = User.find({ _id: { $in: friendIds } });

        if (keyword) userQuery = userQuery.where(queryConditions);

        let listFriend = await userQuery.exec();
        
        listFriend = listFriend.map(item => ({
            name: item.name,
            urlImage: item.urlImage ? item.urlImage : "https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg",
            presence : true,
            id       : item.id,
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

exports.updateFriendStatus = async (req, res) => {
    try {
        let userId              = await helper.getInfoCurrentUser(req, res);
        let {friend_id, status} = req.body;

        let statusSender = 1 ;

       switch (status) {
        case 1 : // ko đồng ý kb 
            statusSender = 1;
            break;

        case 2: // Gửi lời mời
            statusSender = 4;
            break;
       
        case 3: // cả 2 dồng ý
            statusSender = 3;
            break;
       }

        let currentUserFriendData = await Friends.findOne({ userID: userId, friendId: friend_id });

        if (!currentUserFriendData) {
            currentUserFriendData = new Friends({
                userID: userId,
                friendId: friend_id,
                status : status
            });

            await currentUserFriendData.save();
        } else {
            currentUserFriendData.status = status;
            await currentUserFriendData.save();
        }

        let senderFriendData = await Friends.findOne({ userID: friend_id, friendId: userId });

        if (!senderFriendData) {
            senderFriendData = new Friends({
                userID: friend_id,
                friendId: userId,
                status : statusSender
            });

            await senderFriendData.save();
        } else {
            senderFriendData.status = statusSender;
            senderFriendData.save();
        }

        let userInfo = await User.findById(userId)

        let friendInfo = await User.findById(friend_id)

        let bodyNotification = ""
        let titleNotification = ""

        switch (status) {
            case 2: 
            bodyNotification = `${userInfo.name} đã gửi yêu cầu kết bạn`
            titleNotification = "Thông báo kết bạn";
            break;   
            case 3: 
            bodyNotification = `${userInfo.name} đã đồng ý kết bạn`
            titleNotification = "Thông báo kết bạn";
            break;
            case 1:
            case 4:     
            default:
                break;
        }

        await fcmService.sendNotification(
          friendInfo.deviceToken,
          titleNotification,
          bodyNotification,
          {
            event: "add_contact",
            data: JSON.stringify({
              sender_status: status,
              friend_status: statusSender,
              friend_id: userId,
              urlImage: userInfo.urlImage,
              friend_info : {
                name : userInfo.name,
                urlImage : userInfo.urlImage ?  userInfo.urlImage :"https://static.tuoitre.vn/tto/i/s626/2015/09/03/cho-meo-12-1441255605.jpg",
                presence : true,
                id: userInfo.id,
              }
            }),
          }
        );

        return BaseResponse.customResponse(res, "Update successfully", 1, 200, { user_status : currentUserFriendData.status });
    } catch(err) {
        return BaseResponse.customResponse(res, err.toString(), 0, 500);
    }
}