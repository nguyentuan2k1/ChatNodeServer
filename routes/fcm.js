const fetch = require('node-fetch');
const router = require('express').Router();

router.post('/sendToAll', (req, res) => {
        var notification = {
                "title": "Title",
                "text": "Subtitle"
        }

        var notification_body = {
                'notification': notification,
        }
        fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                        'Authorization': 'key=' + process.env.KeyFCM,
                        'Content-Type': 'application/json'
                },
                'body': JSON.stringify(notification_body)
        }).then(() => {
                res.status(200).send('Notification send successfully');
        }).catch((err) => {
                res.status(400).send('Something went wrong!');
                console.log(err);
        });
});
module.exports = router;