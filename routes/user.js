const router = require('express').Router();

const userController = require('../controllers/userController');

router.post("/getchatkeyword",userController.findChatByKeyWord);

module.exports = router;