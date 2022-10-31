const router = require('express').Router();

const messageController = require('../controllers/messageController');

router.post("/sendmessage", messageController.sendMessage);


module.exports = router;