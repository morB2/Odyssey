import Follow from "../models/followModel.js";
import User from "../models/userModel.js";

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) throw new Error("You cannot follow yourself.");

  const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
  if (existingFollow) throw new Error("You are already following this user.");

  const follow = new Follow({ follower: followerId, following: followingId });
  await follow.save();
  return follow;
};

export const unfollowUser = async (followerId, followingId) => {
  const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
  if (!existingFollow) throw new Error("You are not following this user.");

  await Follow.deleteOne({ _id: existingFollow._id });
  return true;
};

export const getFollowers = async (userId) => {
  // Users who follow the given user
  const followers = await Follow.find({ following: userId }).populate("follower", "name username avatar");
  return followers.map(f => f.follower);
};

export const getFollowing = async (userId) => {
  // Users the given user is following
  const following = await Follow.find({ follower: userId }).populate("following", "name username avatar");
  return following.map(f => f.following);
};
