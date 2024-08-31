const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// ... other routes ...

router.post('/logout', chatController.logout);

module.exports = router;