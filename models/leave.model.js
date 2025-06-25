const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    employeeName: {
        type: String,
        required: true
    },
    leaveType: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },

}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
