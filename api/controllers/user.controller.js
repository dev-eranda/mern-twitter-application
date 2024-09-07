import bcrypt from "bcryptjs";
import Notification from "../models/notofication.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow, unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow
      await Promise.all([
        User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }),
        User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }),
      ]);

      const followingUsers = currentUser.following.filter(
        (followinfId) => followinfId.toString() !== id
      );

      res.status(200).json(followingUsers);
    } else {
      //follow
      await Promise.all([
        User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }),
        User.findByIdAndUpdate(req.user._id, { $push: { following: id } }),
        new Notification({
          from: req.user._id,
          to: userToModify._id,
          type: "follow",
        }).save(),
      ]);

      currentUser.following.push(id);

      return res.status(200).json(currentUser.following);
    }
  } catch (error) {
    console.error("Error in followUnfollowUser controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filterUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filterUsers.slice(0, 10);
    suggestedUsers.forEach((user) => (user.password = undefined));

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedUsers controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      fullName,
      currentPassword,
      newPassword,
      email,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if username or email already exists, excluding the current user by id
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: userId }, // Exclude the current user from this search
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email is already taken" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    if (
      (!currentPassword && newPassword) ||
      (currentPassword && !newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        // note: https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    await user.save();

    user.password = undefined;

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUserProfile controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
