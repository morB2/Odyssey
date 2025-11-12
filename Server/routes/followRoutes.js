import express from "express";
import { 
  followUserController, 
  unfollowUserController, 
  getFollowersController, 
  getFollowingController 
} from "../controller/followController.js";

const router = express.Router();

// Follow a user
router.post("/:userId/follow", followUserController);

// Unfollow a user
router.post("/:userId/unfollow", unfollowUserController);

// Get all followers of a user
router.get("/:userId/followers", getFollowersController);

// Get all users a user is following
router.get("/:userId/following", getFollowingController);

export default router;
