import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  getAllTasks,
  updateUser,
  deleteUser,
  updateTask,
  deleteTask,
  getUserTasks,       // <-- NEW
} from "../controllers/adminController.js";

const router = express.Router();
router.use(protect, adminOnly);

// User routes
router.get("/users", getAllUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

// ⭐ NEW: tasks created by a specific user
router.get("/users/:id/tasks", getUserTasks);

// Task routes
router.get("/tasks", getAllTasks);
router.put("/task/:id", updateTask);
router.delete("/task/:id", deleteTask);

export default router;


