const Leave = require("../models/leave.model");


exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching leaves." });
  }
};

exports.createLeave = async (req, res) => {
  try {
    let { employeeName, leaveType, startDate, endDate, reason, status } = req.body;

    // Basic validation
    if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Format dates to "dd-mm-yyyy"
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const newLeave = new Leave({
      employeeName,
      leaveType,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      reason,
      status: status || "pending",
    });

    const savedLeave = await newLeave.save();
    return res.status(201).json({ success: true, data: savedLeave });
  } catch (error) {
    console.error("Error creating leave:", error.message);
    return res.status(400).json({ success: false, message: "Invalid data", error: error.message });
  }
};
exports.updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLeave = await Leave.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLeave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    return res.status(200).json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error("Error updating leave:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLeave = await Leave.findByIdAndDelete(id);

    if (!deletedLeave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    return res.status(200).json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave:", error.message);
    return res.status(500).json({ success: false, message: "Server error while deleting leave." });
  }
};
