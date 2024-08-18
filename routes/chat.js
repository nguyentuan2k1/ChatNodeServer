const router = require('express').Router();

const chatController = require('../controllers/chatController');

router.get('/get-chats', chatController.getChatsIDByUserID);

module.exports = router;