const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    twitchId: String,
    login: String,
    accessToken: String,
    refreshToken: String,
    botActive: Boolean,
    profileImageUrl: String
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
