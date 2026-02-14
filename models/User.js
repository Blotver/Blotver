const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    twitchId: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    accessToken: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
