const User = require("../models/user.model");
const Attendance = require("../models/attendance.model");

// Create Attendance Record
exports.createAttendance = async (req, res) => {
    try {
        const { userId, date, inTime, outTime, status, remarks } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required!",
            });
        }

        if (!date || !inTime || !outTime || !status) {
            return res.status(400).json({ message: "All fields are required !" });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const attendance = new Attendance({
            userId: user._id,
            userName: user.name,
            date,
            inTime,
            outTime,
            status,
            remarks
        });
        await attendance.save();

        user.attendance.push(attendance._id);
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Attendance Record Created Successfully !",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Create Attendance !",
            error: error.message
        });
    }
};

// Get All Attendance Records
exports.getAllAttendance = async (req, res) => {
    try {
        const attendances = await Attendance.find()
            .populate("userName")
            .select("-password")
            .sort({ createdAt: -1 });

        if (!attendances) {
            return res.status(404).json({ message: "Attendance not found !" });
        }

        return res.status(200).json({
            success: true,
            message: "All Attendance Records Fetched Successfully !",
            data: attendances
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Getting All Attendances !",
            error: error.message
        });
    }
};

// Get My Attendance
exports.getMyAttendance = async (req, res) => {
    try {
        const attendances = await Attendance.find({ userId: req.user._id })
            .populate("userId")
            .select("-password")
            .sort({ createdAt: -1 });

        if (!attendances) {
            return res.status(404).json({ message: "Attendance not found !" });
        }

        return res.status(200).json({
            success: true,
            message: "My Attendance Records Fetched Successfully !",
            data: attendances
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Getting My Attendances !",
            error: error.message
        });
    }
}

// update Attendance Record
exports.updateAttendance = async (req, res) => {
    try {
        const { userId, date, inTime, outTime, status, remarks } = req.body;
        const { id } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required!",
            });
        }

        if (!date || !inTime || !outTime || !status) {
            return res.status(400).json({ message: "All fields are required !" });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const attendance = await Attendance.findByIdAndUpdate(
            id,
            {
                userId: user._id,
                date,
                inTime,
                outTime,
                status,
                remarks
            },
            { new: true }
        );

        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found !" });
        }
        await attendance.save();

        return res.status(200).json({
            success: true,
            message: "Attendance Record Updated Successfully !",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Update Attendance !",
            error: error.message
        });
    }
};

// Delete Attendance Record
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const attendance = await Attendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found !" });
        }

        await User.findByIdAndUpdate(
            attendance.userId,
            {
                $pull: { attendance: id }

            }
        );

        return res.status(200).json({
            success: true,
            message: "Attendance Record Deleted Successfully !",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Delete Attendance !",
            error: error.message
        });
    }
};
