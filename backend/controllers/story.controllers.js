import uploadOnCloudinary from "../config/cloudinary.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";

export const uploadStory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.story) {
      await Story.findByIdAndDelete(user.story);
      user.story = null;
    }
    const { mediaType } = req.body;

    let media;
    if (req.file) {
      media = await uploadOnCloudinary(req.file.path);
    } else {
      return res.status(400).json({ message: "Media file is required" });
    }

    const story = await Story.create({
      author: req.userId,
      mediaType,
      media,
    });
    user.story = story._id;
    await user.save();

    // Populate the story with author details
    const populatedStory = await Story.findById(story._id)
      .populate("author", "name userName profileImage")
      .populate("viewers", "name userName profileImage");

    return res.status(201).json(populatedStory);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error uploading story: ${error.message}` });
  }
};

export const viewStory = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const viewersIds = story.viewers.map((id) => id.toString());
    if (!viewersIds.includes(req.userId.toString())) {
      story.viewers.push(req.userId);
      await story.save();
    }

    const populatedStory = await Story.findById(story._id)
      .populate("author", "name userName profileImage")
      .populate("viewers", "name userName profileImage");

    return res.status(200).json(populatedStory);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error viewing story: ${error.message}` });
  }
};

export const getStoryByUserName = async (req, res) => {
  try {
    const userName = req.params.userName;
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const story = await Story.findOne({
      author: user._id,
    }).populate("author viewers");

    return res.status(200).json([story]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching story: ${error.message}` });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const followingIds = currentUser.following;

    const stories = await Story.find({
      author: { $in: followingIds },
    })
      .populate("viewers author")
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching stories: ${error.message}` });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.story) {
      return res.status(404).json({ message: "Story not found" });
    }

    await Story.findByIdAndDelete(user.story);
    user.story = null;
    await user.save();

    return res.status(204).json({ message: "Story deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error deleting story: ${error.message}` });
  }
};
