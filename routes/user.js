const router = require('express').Router();

const userController = require('../controllers/userController');

router.post("/getchatkeyword", userController.findChatByKeyWord);

router.post("/getchats", userController.getChats);

router.post("/createandjoinchat", userController.createAndJoinChat);

router.post("/changeThemeMode",userController.changeThemeMode);

router.post("/changeLanguage",userController.changeLanguage);

module.exports = router;