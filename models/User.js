const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    twitchId: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    accessToken: { type: String, required: true },
    botActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("User", userSchema);

