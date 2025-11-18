import Follow from "../models/followModel.js";
import User from "../models/userModel.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
function normalizeAvatar(avatar) {
  if (!avatar || typeof avatar !== "string") return avatar;
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
  return avatar;
}

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId)
    throw new Error("You cannot follow yourself.");

  const existingFollow = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });
  if (existingFollow) throw new Error("You are already following this user.");

  const follow = new Follow({ follower: followerId, following: followingId });
  await follow.save();
  return follow;
};

export const unfollowUser = async (followerId, followingId) => {
  const existingFollow = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });
  if (!existingFollow) throw new Error("You are not following this user.");

  await Follow.deleteOne({ _id: existingFollow._id });
  return true;
};

export const getFollowers = async (userId) => {
  // Users who follow the given user — return populated User objects
  const followers = await Follow.find({ following: userId }).populate(
    "follower",
    "_id firstName lastName email avatar createdAt updatedAt"
  );
  // map to the populated user document (or filter nulls) and normalize avatar URLs
  return followers
    .map((f) => {
      const u = f.follower;
      if (u && u.avatar) u.avatar = normalizeAvatar(u.avatar);
      return u;
    })
    .filter(Boolean);
};

export const getFollowing = async (userId) => {
  // Users the given user is following — return populated User objects
  const following = await Follow.find({ follower: userId }).populate(
    "following",
    "_id firstName lastName email avatar createdAt updatedAt"
  );
  return following
    .map((f) => {
      const u = f.following;
      if (u && u.avatar) u.avatar = normalizeAvatar(u.avatar);
      return u;
    })
    .filter(Boolean);
};
