var admin = require("firebase-admin");
var serviceAccount = require("../firebase-adminSDK.json");
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
});
// const keyFCM = "key=AAAAAhBAkwA:APA91bEeXRXiQfvyCIiBna06at2R7WIEMrBjzDz8r7XfhdPF-P9mZSzbUs0m6wkTtN6vNyZ_bKm6uV4IujK_LnafASct2tHToIeEXRadZ7ZYecLYuZabrwhmzOL035w9Bedz4MSmeeoe";
const messaging = admin.messaging();
exports.sendNotification = async (to, notification, data, android) => {
        let message = {
                notification: notification,
                token: to,
                data: data,
                android: android,
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
