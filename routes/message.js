const router = require('express').Router();
const chatMessagesController = require("../controllers/chatMessagesController");

router.post("/insertMessages", chatMessagesController.insertManyChatMessage);

router.post("/getMessages", chatMessagesController.getMessagesByChatID);

module.exports = router;