// const authorizeRole = (roles) => (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//         return res.status(403).json({
//             message: "Unauthorized Role"
//         });
//     }
//     next();
// };

// module.exports = authorizeRole;



const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized Role" });
        }
        next();
    };
}

module.exports = authorizeRole;