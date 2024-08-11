const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
        email: {
                type: String,
                required: true,
                unique: true,
        },
        password: {
                type: String,
                required: true,
        },
        name: {
                type: String,
                required: true,
        },
        isDarkMode: {
                type: Boolean,
                default: false,
        },
        urlImage: {
                type: String,
                default: "",
        },
        deviceToken: {
                type: String,
                default: "",
        },
        languageCode:{
                type: String,
                required: true,
                default: "vi",
        },
        countryCode:{
                type: String,
                required: true,
                default: "VN",
        }
}, { timeStamp: true }
);
module.exports = mongoose.model("User", UserSchema);