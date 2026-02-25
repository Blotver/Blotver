const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "New Widget"
    },
    type: {
        type: String,
        default: "overlay"
    },
    data: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Widget", widgetSchema);
