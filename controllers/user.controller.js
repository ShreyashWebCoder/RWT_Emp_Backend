const User = require("../models/user.model");
const formidable = require("formidable");
const cloudinary = require("../config/cloudinary");

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        if (!users) {
            return res.status(404).json({ message: "User mot found !" });
        }
        return res.status(200).json({
            success: true,
            message: "All Users Fetched Successfully !",
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in GetAllUsers !",
            message: error.message
        });
    }
};

// Create User
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, department, birthday, status } = req.body;
        console.log(email, password, role, phone);

        if (!name || !email || !password || !role || !phone || !department) {
            return res.status(400).json({ message: "All fields are required !" });
        }

        const userExist = await User.findOne({ email }).select("-password");
        if (userExist) {
            return res.status(400).json({ message: "User already Added !" });
        }

        const newCreatedUser = await User.create({
            name,
            email,
            password,
            role,
            phone,
            department,
            birthday: birthday || null,
            status: status || "active"
        })
        if (!newCreatedUser) {
            return res.status(400).json({ message: "User not created !" });
        }

        await newCreatedUser.save();

        return res.status(200).json({
            success: true,
            message: "User Created Successfully !",
            data: newCreatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in CreateUser !",
            message: error.message
        });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, phone, department, birthday, status } = req.body;
        const { id } = req.params;

        if (!name || !email || !role || !phone || !department) {
            return res.status(400).json({ message: "All fields are required !" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name,
                email,
                role,
                phone,
                department,
                birthday: birthday || null,
                status: status || "active"
            },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(400).json({ message: "User not updated !" });
        }

        return res.status(200).json({
            success: true,
            message: "User Updated Successfully !",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in UpdateUSer !",
            message: error.message
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {

        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id).select("-password");

        if (!deletedUser) {
            return res.status(400).json({ message: "User not deleted !" });
        }

        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully !",
            data: deletedUser
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in DeleteUSer !",
            message: error.message
        });
    }

};

// User Details
exports.userDetails = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "User ID is required !" });
        }

        const userDetails = await User.findById(id)
            .select("-password")
            .populate("feeds", "-author -likes -comments")
            .populate("attendance", "-userId");

        if (!userDetails) {
            return res.status(400).json({ message: "User not found !" });
        }
        return res.status(200).json({
            success: true,
            message: "User Details Fetched Successfully !",
            data: userDetails
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in UserDetails !",
            message: error.message
        });
    }
};

// Update Profile
// exports.updateProfile = async (req, res) => {
//     try {
//         const userExist = await User.findById(req.user._id);
//         if (!userExist) {
//             return res.status(400).json({
//                 message: "User don't Exist !",
//             });
//         }

//         const form = new formidable.Formidable({
//             multiples: false,
//             keepExtensions: true,
//             maxFileSize: 200 * 1024 * 1024, // 200MB Limit
//         });

//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 return res.status(400).json({
//                     message: "Error in formidable !",
//                     error: err.message,
//                 });
//             }

//             const text = Array.isArray(fields.text)
//             ? fields.text.join(" ")
//             : fields.text?.toString();
//             fields.text= text || "";

//             if (fields.text) {

//                 await User.findByIdAndUpdate(
//                     req.user._id,
//                     { bio: text },
//                     { new: true }
//                 );
//             }

//             if (files.media) {
//                 if (userExist.public_id) {
//                     await cloudinary.uploader.destroy(
//                         userExist.public_id,
//                         (error, result) => {
//                             if (error) {
//                                 return res.status(400).json({
//                                     message: "Error is Destory Profile in Cloudinary !",
//                                     error: error.message,
//                                 });
//                             }
//                             if (result) {
//                                 return res.status(200).json({
//                                     message: "Old Profile Pic Deleted !",
//                                 });
//                             }
//                         }
//                     );
//                 }
//                 const uploadMedia = await cloudinary.uploader.upload(
//                     files.media.filepath,
//                     {
//                         folder: "SaturnX_Management_System/Profiles",
//                         filename_override: "profile_" + Date.now(),
//                         use_filename: true,
//                         unique_filename: false
//                     }
//                 );
//                 if (!uploadMedia) {
//                     return res.status(400).json({
//                         message: "Error in Uploading ProfilePic !",
//                     });
//                 }

//                 await User.findByIdAndUpdate(
//                     req.user._id,
//                     {
//                         profilePic: uploadMedia.secure_url,
//                         public_id: uploadMedia.public_id,
//                     },
//                     { new: true }
//                 );
//                 await userExist.save();
//             }

//         });

//         return res.status(201).json({
//             message: "Profile Updated Successfully !",
//         });
//     } catch (error) {
//         res.status(400).json({
//             message: "Error in Update-Profile !",
//             error: error.message,
//         });
//     }
// };


exports.updateProfile = async (req, res) => {
    try {
        const userExist = await User.findById(req.user._id).select("-password -secretKey");
        if (!userExist) {
            return res.status(400).json({ message: "User doesn't exist!" });
        }

        // const { text } = req.body;

        // // ✅ Update bio if provided
        // if (text) {
        //     userExist.bio = String(text);
        // }

        // ✅ Handle new profile image (if uploaded)
        if (req.file) {
            // 🔄 Delete old image from Cloudinary
            if (userExist.public_id) {
                try {
                    await cloudinary.uploader.destroy(userExist.public_id);
                } catch (cloudErr) {
                    console.error("Cloudinary delete error:", cloudErr.message);
                }
            }

            // ☁ Upload new image
            const uploaded = await cloudinary.uploader.upload(req.file.path, {
                folder: "SaturnX_Management_System/Profiles",
                public_id: `profile_${Date.now()}`,
                resource_type: "auto",
            });

            userExist.profilePic = uploaded.secure_url;
            userExist.public_id = uploaded.public_id;

            // ✅ Ensure profilePic is an array
            // if (!Array.isArray(userExist.profilePic)) {
            //     userExist.profilePic = [];
            // }

            // 🔄 Push the new image
            // userExist.profilePic.push({
            //     url: uploaded.secure_url,
            //     public_id: uploaded.public_id,
            //     uploadedAt: new Date()
            // });

        }

        // ✅ Ensure required fields still exist
        // userExist.department = userExist.department || "Unknown";
        // userExist.feeds = userExist.feeds || [];

        await userExist.save();

        console.log("Profile updated:", {
            userId: req.user._id,
            bio: userExist.bio,
            profilePic: userExist.profilePic,
        });

        return res.status(201).json({
            message: "Profile Updated Successfully!",
            profilePic: userExist.profilePic,
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(400).json({
            message: "Error in updateProfile!",
            error: error.message,
        });
    }
};


