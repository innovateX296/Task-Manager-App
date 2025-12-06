const API_URL = "/api/tasks";

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusInput = document.getElementById("status");
const taskList = document.getElementById("taskList");
const filterStatus = document.getElementById("filterStatus");

let tasks = [];

// Load tasks on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
});

// Fetch tasks from backend
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    tasks = await res.json();
    renderTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// Render tasks list
function renderTasks() {
  const selectedFilter = filterStatus.value;
  taskList.innerHTML = "";

  const filteredTasks =
    selectedFilter === "All"
      ? tasks
      : tasks.filter((t) => t.status === selectedFilter);

  if (filteredTasks.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks found.";
    taskList.appendChild(li);
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const mainDiv = document.createElement("div");
    mainDiv.className = "task-main";

    const titleEl = document.createElement("div");
    titleEl.className = "task-title";
    titleEl.textContent = task.title;

    const descEl = document.createElement("div");
    descEl.className = "task-desc";
    descEl.textContent = task.description || "(No description)";

    const metaEl = document.createElement("div");
    metaEl.className = "task-meta";
    metaEl.textContent = `Created: ${new Date(
      task.createdAt
    ).toLocaleString()}`;

    mainDiv.appendChild(titleEl);
    mainDiv.appendChild(descEl);
    mainDiv.appendChild(metaEl);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const statusSpan = document.createElement("span");
    statusSpan.className = "task-status " + getStatusClass(task.status);
    statusSpan.textContent = task.status;

    const statusSelect = document.createElement("select");
    ["Pending", "In Progress", "Done"].forEach((statusOption) => {
      const opt = document.createElement("option");
      opt.value = statusOption;
      opt.textContent = statusOption;
      if (task.status === statusOption) opt.selected = true;
      statusSelect.appendChild(opt);
    });

    statusSelect.addEventListener("change", () => {
      updateTask(task.id, {
        ...task,
        status: statusSelect.value,
      });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actionsDiv.appendChild(statusSpan);
    actionsDiv.appendChild(statusSelect);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(mainDiv);
    li.appendChild(actionsDiv);

    taskList.appendChild(li);
  });
}

// Helper to get CSS class for status
function getStatusClass(status) {
  if (status === "Pending") return "status-pending";
  if (status === "In Progress") return "status-in-progress";
  if (status === "Done") return "status-done";
  return "";
}

// Handle form submit (Add new task)
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTask = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusInput.value,
  };

  if (!newTask.title) {
    alert("Title is required");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    const createdTask = await res.json();
    tasks.push(createdTask);
    renderTasks();

    taskForm.reset();
    statusInput.value = "Pending";
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

// Update task
async function updateTask(id, updatedTask) {
  try:
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    const data = await res.json();

    // Update in local array
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = data;
      renderTasks();
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

// Delete task
async function deleteTask(id) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// Filter change
filterStatus.addEventListener("change", () => {
  renderTasks();
});
