const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // To parse JSON body
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

// In-memory "database"
let tasks = [];
let nextId = 1;

// GET all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// CREATE a task
app.post("/api/tasks", (req, res) => {
  const { title, description, status } = req.body;

  if (!title || !status) {
    return res.status(400).json({ message: "Title and status are required" });
  }

  const newTask = {
    id: nextId++,
    title,
    description: description || "",
    status, // "Pending" | "In Progress" | "Done"
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// UPDATE a task
app.put("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, status } = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  const existingTask = tasks[taskIndex];

  tasks[taskIndex] = {
    ...existingTask,
    title: title !== undefined ? title : existingTask.title,
    description: description !== undefined ? description : existingTask.description,
    status: status !== undefined ? status : existingTask.status,
  };

  res.json(tasks[taskIndex]);
});

// DELETE a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: "Task deleted", deletedTask });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
