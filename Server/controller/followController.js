import * as followService from "../services/followService.js";

export const followUserController = async (req, res) => {
  try {
    const followerId = req.body.userId; // Ideally from JWT
    const followingId = req.params.userId;

    const follow = await followService.followUser(followerId, followingId);
    res.status(200).json({ message: "User followed!", follow });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unfollowUserController = async (req, res) => {
  try {
    const followerId = req.body.userId;
    const followingId = req.params.userId;

    await followService.unfollowUser(followerId, followingId);
    res.status(200).json({ message: "User unfollowed!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFollowersController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const followers = await followService.getFollowers(userId);
    res.status(200).json(followers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFollowingController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const following = await followService.getFollowing(userId);
    res.status(200).json(following);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
