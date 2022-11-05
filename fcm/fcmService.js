var admin = require("firebase-admin");
var serviceAccount = require("../firebase-adminSDK.json");
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
});
const messaging = admin.messaging();

exports.sendNotification = async (to, notification,data) => {
        let message = {
                notification: notification,
                token: to,
                data:data
        };
        try {
                const response = await messaging.send(message);
                if (response) {
                        console.log("send notification success");
                        // console.log(response.toString());
                }
        } catch (error) {
                console.log("send notification failed");
                console.log(error.toString());
        }

}
