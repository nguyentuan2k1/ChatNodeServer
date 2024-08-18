const router = require('express').Router();

const friendController = require('../controllers/FriendController');

router.get("/get-friend", friendController.getFriends);

module.exports = router;