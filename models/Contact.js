const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
        userID:{
                type:String,
                required: true,
                unique:true,
        },
        contactID:{
                type:String,
                required:true,
                unique:true
        }
});

module.exports = mongoose.model("Contact", ContactSchema);