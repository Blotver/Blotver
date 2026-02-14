const mongoose = require("mongoose");

const overlayConfigSchema = new mongoose.Schema({
  channelName: { type: String, required: true, unique: true },

  clipVolume: { type: Number, default: 1 },
  clipSize: { type: Number, default: 400 },
  showUsername: { type: Boolean, default: true },

  textColor: { type: String, default: "#ffffff" },
  backgroundColor: { type: String, default: "#000000" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OverlayConfig", overlayConfigSchema);
