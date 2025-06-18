const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        // Employee name
        userName: {
            // type: mongoose.Schema.Types.ObjectId,
            // ref: "User",
            // required: true,
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        inTime: {
            type: String,
            required: true,
        },
        outTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["present", "absent", "leave", "late", "half-day"],
            required: true,
        },
        remarks: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
