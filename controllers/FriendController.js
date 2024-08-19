const { default: mongoose } = require('mongoose');
const BaseResponse = require('../models/BaseResponse');
const Friends = require('../models/Friends');
let options = { returnDocument: 'after' }
const dotenv = require("dotenv");
const User = require('../models/User');
const helper = require('../services/helper')
const Paginate     = require('../models/Pagination');

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
            imageUrl: item.imageUrl ?? null,
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
      
