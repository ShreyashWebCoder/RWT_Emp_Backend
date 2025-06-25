const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");
const errorHandler = require("../middlewares/errorHandler");
const fileValidation = require("../middlewares/fileValidation");
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    userDetails,
    updateProfile,
} = require("../controllers/user.controller");

const attendanceController = require("../controllers/attendance.controller");

const {
    getAllLeaves,
    createLeave,
    updateLeave,
    deleteLeave,
  } = require("../controllers/leave.controllers");

const {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require("../controllers/announcement.controller");

const {
    createFeed,
    getAllFeeds,
    updateFeed,
    deleteFeed,
    getFeedByUserId,
    likeUnlikeFeed,
    addCommentOnFeed,
    deleteCommentOnFeed,
    updateCommentOnFeed,
} = require("../controllers/feed.controller");
const upload = require("../middlewares/upload");

const router = express.Router();

// Middleware of Checking authenticated User & it's Role
router.use(authMiddleware, authorizeRole("admin", "employee", "manager"), errorHandler);

// User Management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/userDetails/:id", userDetails);

// Update User Profile
router.put("/users/profile/:id", upload.single("media"), fileValidation, updateProfile);

// Attendance Management
// router.get("/all_attendance", getAllAttendance);
// // router.get('/attendance', getMyAttendance);
// router.post("/attendance", createAttendance);
// router.put("/attendance/:id", updateAttendance);
// router.delete("/attendance/:id", deleteAttendance);

// Punch In/Out Routes
router.post('/attendance/punch-in', attendanceController.punchIn);
router.post('/attendance/punch-out', attendanceController.punchOut);
// Attendance Data Routes
router.get('/attendance/today/:employeeId', attendanceController.getTodayAttendance);
router.get('/attendance/records/:employeeId', attendanceController.getAttendanceRecords);

// Leave Management
router.get("/leaves", getAllLeaves);
router.post("/leave", createLeave);
router.put("/leave/:id", updateLeave);
router.delete("/leave/:id", deleteLeave);

// Feed Management
router.get("/feeds", getAllFeeds);
router.get("/feed/:id", getFeedByUserId);
router.post("/feed", upload.single("media"), fileValidation, createFeed);
router.put("/feed/update/:id", fileValidation, updateFeed);
router.delete("/feed/:id", deleteFeed);
// ----------------------
router.put("/feed/:id", likeUnlikeFeed);
router.post("/feed/comment/:id", addCommentOnFeed);
router.delete("/feed/comment/:feedId/:commentId", deleteCommentOnFeed);
// router.put("/feed/comment/:feedId/:commentId", updateCommentOnFeed);

// Announcements Management
router.get("/announcements", getAllAnnouncements);
router.post("/announcement", createAnnouncement);
router.delete("/announcement/:id", deleteAnnouncement);


// Leave Management
module.exports = router;
