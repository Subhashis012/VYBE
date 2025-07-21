import uploadOnCloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getSocketId } from "../socket.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .populate("posts loops posts.author posts.comments saved saved.author story following")

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching user: ${error.message}` });
  }
};

export const suggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId }, // Exclude the current user
    }).select("-password ");
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching suggested users: ${error.message}` });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { name, userName, bio, profession, gender } = req.body;

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sameUserWithUserName = await User.findOne({ userName }).select(
      "-password"
    );
    if (sameUserWithUserName && !sameUserWithUserName._id.equals(req.userId)) {
      return res.status(400).json({ message: "Username already taken" });
    }

    let profileImage;
    if (req.file) {
      profileImage = await uploadOnCloudinary(req.file.path);
    }

    user.name = name;
    user.userName = userName;
    user.bio = bio;
    user.profession = profession;
    user.gender = gender;
    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error updating profile: ${error.message}` });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userName = req.params.userName;
    const user = await User.findOne({ userName })
      .select("-password")
      .populate("posts loops followers following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching profile: ${error.message}` });
  }
};

export const follow = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.targetUserId;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    if (currentUserId == targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );

      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({
        following: false,
        followingList: currentUser.following,
        message: "Unfollowed successfully",
      });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      if (currentUser._id != targetUser._id) {
        const notification = await Notification.create({
          sender: currentUser._id,
          receiver: targetUser._id,
          type: "follow",
          message: "started following you",
        });
        const populatedNotification = await Notification.findById(
          notification._id
        ).populate("sender receiver");
        const receiverSocketId = getSocketId(targetUser._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "newNotification",
            populatedNotification
          );
        }
      }

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        following: true,
        followingList: currentUser.following,
        message: "Followed successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error following user: ${error.message}` });
  }
};


export const followingList = async (req, res) => {
  try {
    const result = await User.findById(req.userId)
      

    return res.status(200).json(result.following);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching following list: ${error.message}` });
  }
}


export const search = async (req, res) => {
  try {
    const keyWord = req.query.keyword;
    if (!keyWord) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const users = await User.find({
      $or: [
        {userName:{$regex: keyWord, $options: 'i'}},
        {name:{$regex: keyWord, $options: 'i'}},
      ]
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error searching users: ${error.message}` });
  }
}


export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.userId,
    }).populate("sender receiver post loop").sort({ createdAt: -1 });
      
    return res.status(200).json(notifications);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching notifications: ${error.message}` });
  }
}


export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body; 

    if(Array.isArray(notificationId)) {
      await Notification.updateMany(
        { _id: { $in: notificationId }, receiver: req.userId },
        { $set: { isRead: true } }
      )
    } else {
      await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: req.userId },
        { $set: { isRead: true } }
      )
    }

    return res.status(200).json({message: "Notification marked as read"});
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error marking notification as read: ${error.message}` });
  }
}