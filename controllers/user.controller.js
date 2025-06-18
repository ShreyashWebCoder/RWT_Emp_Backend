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

// exports.updateProfile = async (req, res) => {
//     try {
//         const userExist = await User.findById(req.user._id);
//         if (!userExist) {
//             return res.status(404).json({ message: "User not found!" });
//         }

//         const form = new formidable.IncomingForm();

//         const { fields, files } = await new Promise((resolve, reject) => {
//             form.parse(req, (err, fields, files) => {
//                 if (err) return reject(err);
//                 resolve({ fields, files });
//             });
//         });

//         if (fields.text) {
//             const text = Array.isArray(fields.text) ? fields.text[0] : fields.text;
//             await User.findByIdAndUpdate(
//                 req.user._id,
//                 { bio: text },
//                 { new: true }
//             );
//         }

//         if (files.media && files.media.size > 0) {
//             try {
//                 if (userExist.public_id) {
//                     try {
//                         await cloudinary.uploader.destroy(userExist.public_id);
//                         console.log("🗑 Old image deleted from Cloudinary");
//                     } catch (deleteError) {
//                         console.error("⚠ Could not delete old image:", deleteError.message);
//                         // Continue with upload even if deletion fails
//                     }
//                 }

//                 const uploadResult = await cloudinary.uploader.upload(
//                     files.media.filepath,
//                     {
//                         folder: "SaturnX_Management_System/Profiles",
//                         filename_override: `profile_${Date.now()}`,
//                         use_filename: true,
//                         unique_filename: false,
//                     }
//                 );

//                 if (!uploadResult || !uploadResult.secure_url) {
//                     throw new Error("Cloudinary upload failed - no URL returned");
//                 }

//                 const updatedUser = await User.findByIdAndUpdate(
//                     req.user._id,
//                     {
//                         profilePic: uploadResult.secure_url,
//                         public_id: uploadResult.public_id,
//                     },
//                     { new: true }
//                 );

//                 console.log("Updated user:", updatedUser);
//                 if (!updatedUser) {
//                     throw new Error("Database update failed");
//                 }

//                 console.log("✅ Cloudinary URL saved to DB:", uploadResult.secure_url);

//             } catch (uploadError) {
//                 console.error("❌ File upload error:", uploadError);
//                 return res.status(500).json({
//                     message: "Profile text updated, but image upload failed",
//                     error: uploadError.message,
//                 });
//             }
//         }

//         return res.status(200).json({
//             message: "✅ Profile updated successfully!",
//         });

//     } catch (error) {
//         console.error("🚨 Profile update error:", error);
//         return res.status(500).json({
//             message: "Failed to update profile",
//             error: error.message,
//         });
//     }
// };

exports.updateProfile = async (req, res) => {
    try {
        const userExist = await User.findById(req.user._id).select("-password -secretKey");
        if (!userExist) {
            return res.status(400).json({
                message: "User don't Exist !",
            });
        }

        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    message: "Error in formidable !",
                    error: err.message,
                });
            }

            if (fields.text) {
                const bioText = Array.isArray(fields.text) ? fields.text[0] : fields.text;

                // await User.findByIdAndUpdate(
                //     req.user._id,
                //     { bio: bioText },
                //     { new: true }
                // );
                userExist.bio = bioText;
                await userExist.save();
            }


            if (fields.media) {
                if (userExist.public_id) {
                    await cloudinary.uploader.destroy(
                        userExist.public_id,
                        (error, result) => {
                            if (error) {
                                return res.status(400).json({
                                    message: "Error is Destory Profile in Cloudinary !",
                                    error: error.message,
                                });
                            }
                            if (result) {
                                return res.status(200).json({
                                    message: "Old Profile Pic Deleted !",
                                });
                            }
                        }
                    );
                }
                const uploadMedia = await cloudinary.uploader.upload(
                    files.media.filepath,
                    {
                        folder: "SaturnX_Management_System/Profiles",
                        public_id: `profile_${Date.now()}`,
                        resource_type: "auto" 
                    }
                );
                if (!uploadMedia) {
                    return res.status(400).json({
                        message: "Error in Uploading ProfilePic !",
                    });
                }

                await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        profilePic: uploadMedia.secure_url,
                        public_id: uploadMedia.public_id,
                    },
                    { new: true }
                );
                await userExist.save();
            }
            console.log("Profile updated successfully:", {
                userId: req.user._id,
                bio: fields.text || userExist.bio,
                profilePic: userExist.profilePic,
            });

            return res.status(201).json({
                message: "Profile Updated Successfully !",
            });
        });


    } catch (error) {
        res.status(400).json({
            message: "Error in Update-Profile !",
            error: error.message,
        });
    }
}

// exports.updateProfile = async (req, res) => {
//     try {
//         const userExist = await User.findById(req.user._id);
//         if (!userExist) {
//             return res.status(400).json({
//                 message: "User doesn't Exist!",
//             });
//         }

//         const form = new formidable.IncomingForm();
//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 return res.status(400).json({
//                     message: "Error parsing form data!",
//                     error: err.message,
//                 });
//             }

//             // Update bio if text exists
//             if (fields.text) {
//                 const bioText = Array.isArray(fields.text) ? fields.text[0] : fields.text;
//                 userExist.bio = bioText;
//                 await userExist.save();
//             }

//             // Handle file upload if media exists
//             if (files.media) {
//                 try {
//                     // Verify file exists and has a path
//                     if (!files.media.filepath) {
//                         return res.status(400).json({
//                             message: "Invalid file upload",
//                             error: "File path missing"
//                         });
//                     }

//                     // Delete old image if exists
//                     if (userExist.public_id) {
//                         await cloudinary.uploader.destroy(userExist.public_id);
//                     }

//                     // Upload new image - using the file buffer instead of path
//                     const result = await cloudinary.uploader.upload(
//                         files.media.filepath,
//                         {
//                             folder: "SaturnX_Management_System/Profiles",
//                             public_id: `profile_${userExist._id}_${Date.now()}`,
//                             resource_type: "auto",
//                             overwrite: true
//                         }
//                     );

//                     // Update user with new image details
//                     userExist.profilePic = result.secure_url;
//                     userExist.public_id = result.public_id;
//                     await userExist.save();

//                 } catch (uploadError) {
//                     console.error("Cloudinary upload error:", uploadError);
//                     return res.status(500).json({
//                         message: "Error uploading to Cloudinary",
//                         error: uploadError.message
//                     });
//                 }
//             }
//             console.log("Profile updated successfully:", {
//                 userId: req.user._id,
//                 bio: userExist.bio,
//                 profilePic: userExist.profilePic,
//                 media: files.media 
//             });

//             return res.status(200).json({
//                 message: "Profile updated successfully",
//                 user: userExist
//             });
//         });

//     } catch (error) {
//         console.error("Profile update error:", error);
//         res.status(500).json({
//             message: "Error updating profile",
//             error: error.message
//         });
//     }
// };


// Change Password
// exports.changePassword = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { oldPassword, newPassword } = req.body;

//         if (!oldPassword || !newPassword) {
//             return res.status(400).json({ message: "All fields are required !" });
//         }

//         const user = await User.findById(id).select("-password");
//         if (!user) {
//             return res.status(400).json({ message: "User not found !" });
//         }

//         const isMatch = await user.comparePassword(oldPassword);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Old Password is incorrect !" });
//         }

//         user.password = newPassword;
//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: "Password Changed Successfully !",
//             data: user
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error in ChangePassword !",
//             message: error.message
//         });
//     }
// }