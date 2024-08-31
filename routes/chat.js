const router = require('express').Router();

const chatController = require('../controllers/chatController');

router.get('/get-chats', chatController.getChatsIDByUserID);

router.post('/take-room-chat', chatController.takeRoomChat);

module.exports = router;