const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục để lưu file tạm
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage });

const chatMessagesController = require("../controllers/chatMessagesController");

router.post("/insertMessages", chatMessagesController.insertManyChatMessage);

router.get("/takeMessages", chatMessagesController.takeMessagesByChatID);

router.post("/updateStatusMessage", chatMessagesController.updateStatusMessageHttp);

router.post("/upload-message-image", upload.single('file'),chatMessagesController.uploadMessageImage);

module.exports = router;