import User from "../models/User.js";
import Task from "../models/Task.js";

// ======================
// Get all users
// ======================
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// ======================
// Get all tasks
// ======================
export const getAllTasks = async (req, res) => {
  const tasks = await Task.find().populate("user", "name email");
  res.json(tasks);
};

// ======================
// Update a user
// ======================
export const updateUser = async (req, res) => {
  try {
    const { name, email, isAdmin, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (password) user.password = password; // auto-hashed in pre-save hook

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// ======================
// Delete a user
// ======================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete tasks associated with this user
    await Task.deleteMany({ user: req.params.id });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

// ======================
// Update a task
// ======================
export const updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title || task.title;
    task.description = description || task.description;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

// ======================
// Delete a task
// ======================
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

// ======================
// ⭐ NEW → Get all tasks of a specific user
// ======================
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.params.id;

    const tasks = await Task.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's tasks" });
  }
};


