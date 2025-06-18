const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "manager", "employee"],
        default: "employee",
    },
    phone: {
        type: Number,
    },
    department: { type: String, required: true },
    birthday: { type: Date },
    status: {
        type: String,
        enum: ["active", "inactive",],
        default: "active"
    },

    bio: {
        type: String
    },
    public_id: {
        type: String
    },
    attendance: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attendance",
        }
    ],
    profilePic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    feeds: {
        type: mongoose.Schema.ObjectId,
        ref: "Feed"
    },
    secretKey: {
        type: String,
        required: function () { return this.role === "admin" || this.role === "manager"; }
    },
    // tokens: [{
    //     type: String
    // }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        console.log(error.message);

    }
});

module.exports = mongoose.model("User", userSchema);
