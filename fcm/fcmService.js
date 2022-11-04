var FCM = require('fcm-node');

var fcm = new FCM(process.env.KeyFCM);

exports.sendNotification = (to,notification,data) =>{
        var message = {
                to: to,
                notification:notification,
                data:data
        };
        fcm.send(message,function(err,response)
        {
             if(err)
             {
                console.log("something has gone wrong" + err);
                console.log("Response:" + response);
             }
             else
             {
                console.log("Successfully send with response: ", response)
             }
        });
}
