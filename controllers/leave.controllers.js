// const Leave = require("../models/leave.model");


// exports.getAllLeaves = async (req, res) => {
//   try {
//     const leaves = await Leave.find().sort({ createdAt: -1 });
//     return res.status(200).json({ success: true, data: leaves });
//   } catch (error) {
//     console.error("Error fetching leaves:", error.message);
//     return res.status(500).json({ success: false, message: "Server error while fetching leaves." });
//   }
// };

// exports.createLeave = async (req, res) => {
//   try {
//     let { employeeName, leaveType, startDate, endDate, reason, status } = req.body;

//     // Basic validation
//     if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided.",
//       });
//     }

//     // Format dates to "dd-mm-yyyy"
//     const formatDate = (dateStr) => {
//       const date = new Date(dateStr);
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const year = date.getFullYear();
//       return `${day}-${month}-${year}`;
//     };

//     const newLeave = new Leave({
//       employeeName,
//       leaveType,
//       startDate: formatDate(startDate),
//       endDate: formatDate(endDate),
//       reason,
//       status: status || "pending",
//     });

//     const savedLeave = await newLeave.save();
//     return res.status(201).json({ success: true, data: savedLeave });
//   } catch (error) {
//     console.error("Error creating leave:", error.message);
//     return res.status(400).json({ success: false, message: "Invalid data", error: error.message });
//   }
// };
// exports.updateLeave = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedLeave = await Leave.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedLeave) {
//       return res.status(404).json({ success: false, message: "Leave not found" });
//     }

//     return res.status(200).json({ success: true, data: updatedLeave });
//   } catch (error) {
//     console.error("Error updating leave:", error.message);
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };

// exports.deleteLeave = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedLeave = await Leave.findByIdAndDelete(id);

//     if (!deletedLeave) {
//       return res.status(404).json({ success: false, message: "Leave not found" });
//     }

//     return res.status(200).json({ success: true, message: "Leave deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting leave:", error.message);
//     return res.status(500).json({ success: false, message: "Server error while deleting leave." });
//   }
// };


const Leave = require("../models/leave.model");

// @desc    Get all leaves (filtered by role)
// @route   GET /api/leaves
// @access  Private
exports.getAllLeaves = async (req, res) => {
  try {
    let query = {};
    
    // If user is employee, only return their leaves
    if (req.user.role === 'employee') {
      query.employeeName = req.user.name;
    }
    
    // If employeeName query parameter is provided (for managers/admins filtering)
    if (req.query.employeeName) {
      query.employeeName = req.query.employeeName;
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({ 
      success: true, 
      data: leaves 
    });
  } catch (error) {
    console.error("Error fetching leaves:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while fetching leaves." 
    });
  }
};

// @desc    Create a new leave
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
  try {
    let { employeeName, leaveType, startDate, endDate, reason, status } = req.body;

    // For employees, force the employeeName to be their own name
    if (req.user.role === 'employee') {
      employeeName = req.user.name;
      status = 'pending'; // Employees can't set status
    }

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
    return res.status(201).json({ 
      success: true, 
      data: savedLeave 
    });
  } catch (error) {
    console.error("Error creating leave:", error.message);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid data", 
      error: error.message 
    });
  }
};

// @desc    Update a leave
// @route   PUT /api/leaves/:id
// @access  Private (Admin/Manager only for status changes)
exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: "Leave not found" 
      });
    }

    // Authorization checks
    if (req.user.role === 'employee') {
      // Employees can only update their own leaves (except status)
      if (leave.employeeName !== req.user.name) {
        return res.status(403).json({ 
          success: false, 
          message: "Not authorized to update this leave" 
        });
      }
      // Employees can't change status
      if (req.body.status && req.body.status !== leave.status) {
        return res.status(403).json({ 
          success: false, 
          message: "Not authorized to change leave status" 
        });
      }
    }

    // Managers can't approve their own leaves
    if (req.user.role === 'manager' && 
        leave.employeeName === req.user.name && 
        req.body.status === 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: "Managers cannot approve their own leaves" 
      });
    }

    // Format dates if they're being updated
    if (req.body.startDate) {
      req.body.startDate = formatDate(req.body.startDate);
    }
    if (req.body.endDate) {
      req.body.endDate = formatDate(req.body.endDate);
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({ 
      success: true, 
      data: updatedLeave 
    });
  } catch (error) {
    console.error("Error updating leave:", error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete a leave
// @route   DELETE /api/leaves/:id
// @access  Private (Admin/Manager or leave owner)
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: "Leave not found" 
      });
    }

    // Authorization check
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        leave.employeeName !== req.user.name) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this leave" 
      });
    }

    await Leave.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ 
      success: true, 
      message: "Leave deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting leave:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while deleting leave." 
    });
  }
};

// Helper function to format dates
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}