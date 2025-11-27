import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTasks, addTask, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

router.use(protect);
router.get("/", getTasks);
router.post("/", addTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
