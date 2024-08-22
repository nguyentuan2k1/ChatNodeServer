const router = require('express').Router();

const friendController = require('../controllers/FriendController');

router.get("/get-friend", friendController.getFriends);

router.post("/add-friend", friendController.addFriend);

router.post('/update-friend-status', friendController.updateFriendStatus);

module.exports = router;