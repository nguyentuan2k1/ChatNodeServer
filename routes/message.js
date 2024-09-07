const router = require('express').Router();
const chatMessagesController = require("../controllers/chatMessagesController");

router.post("/insertMessages", chatMessagesController.insertManyChatMessage);

router.get("/takeMessages", chatMessagesController.takeMessagesByChatID);

router.post("/updateStatusMessage", chatMessagesController.updateStatusMessageHttp);

module.exports = router;