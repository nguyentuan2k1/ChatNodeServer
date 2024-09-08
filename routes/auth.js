const router = require('express').Router();

const authController = require('../controllers/authController');

router.post("/presence", authController.getPresence);
//REGISTER
router.post("/register", authController.register);
//LOGIN
router.post("/login", authController.login);

router.post('/refresh-device-token', authController.refreshDeviceToken);

router.get('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

module.exports = router;