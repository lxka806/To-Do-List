import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const VITE_URL = import.meta.env.VITE_URL;

const COLOR_TAGS = [
  { value: "#3b82f6", label: "Blue", bg: "#eff6ff" },
  { value: "#10b981", label: "Green", bg: "#ecfdf5" },
  { value: "#ef4444", label: "Red", bg: "#fef2f2" },
  { value: "#f59e0b", label: "Amber", bg: "#fffbeb" },
  { value: "#8b5cf6", label: "Purple", bg: "#f5f3ff" },
];

function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  const getHeaders = (isJson = false) => {
    const headers = {};
    if (isJson) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const fetchTotalUsers = async () => {
    try {
      const response = await fetch(`${VITE_URL}/api/leaderboard`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setTotalUsers(data.length);
      }
    } catch {
      setTotalUsers(0);
    }
  };

  const fetchTodos = async () => {
    if (!token) {
      setTodos([]);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${VITE_URL}/api/list`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load todos.");
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodo = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const url = editingTodoId
        ? `${VITE_URL}/api/list/${editingTodoId}`
        : `${VITE_URL}/api/list`;
      const method = editingTodoId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify({
          name: title,
          color: selectedColor,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save task.");

      setTitle("");
      setSelectedColor("#3b82f6");
      setEditingTodoId(null);
      setMessage(editingTodoId ? "Task updated successfully." : "Task added successfully.");
      setTimeout(() => setMessage(""), 2000);
      await fetchTodos();
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (todo) => {
    setEditingTodoId(todo._id);
    setTitle(todo.name || "");
    setSelectedColor(todo.color || "#3b82f6");
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingTodoId(null);
    setTitle("");
    setSelectedColor("#3b82f6");
    setMessage("");
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${VITE_URL}/api/list/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete task.");
      }
      setMessage("Task deleted.");
      setTimeout(() => setMessage(""), 2000);
      await fetchTodos();
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${VITE_URL}/api/list/${id}/toggle`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update task.");
      }
      await fetchTodos();
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    pending: todos.filter((todo) => !todo.completed).length,
    productivity: todos.length ? Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100) : 0,
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.fullname?.split(" ")[0] || "User");
      } catch {
        setUserName("User");
      }
    }
    fetchTotalUsers();
    fetchTodos();
  }, []);

  const getColorStyle = (colorValue) => {
    const color = COLOR_TAGS.find(c => c.value === colorValue);
    return color || COLOR_TAGS[0];
  };

  return (
    <div className="home-container">
      {!isAuthenticated ? (
        /* LOCKED DASHBOARD - Clean blurred preview */
        <div className="locked-dashboard">
          {/* Blurred preview background */}
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-logo"></div>
              <div className="preview-nav"></div>
            </div>
            <div className="preview-stats">
              <div className="preview-card"></div>
              <div className="preview-card"></div>
              <div className="preview-card"></div>
              <div className="preview-card"></div>
            </div>
            <div className="preview-task-list">
              <div className="preview-task"></div>
              <div className="preview-task"></div>
              <div className="preview-task"></div>
            </div>
          </div>

          {/* Center modal card */}
          <div className="lock-card">
            <div className="lock-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V9c0-3.87-3.13-7-7-7z" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                <rect x="8" y="11" width="8" height="11" rx="2" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="12" cy="16" r="1.5" fill="#3b82f6"/>
                <line x1="12" y1="12" x2="12" y2="15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>Welcome to TaskFlow</h2>
            <p>Sign in to manage your tasks, track progress, and stay organized.</p>
            <div className="lock-actions">
              <button onClick={() => navigate("/login")} className="btn-primary">Sign In</button>
              <button onClick={() => navigate("/signup")} className="btn-secondary">Create Account</button>
            </div>
          </div>
        </div>
      ) : (
        /* LOGGED IN DASHBOARD */
        <div className="home-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-header">
              <div>
                <p className="welcome-label">Welcome back, {userName}</p>
                <h1>Dashboard</h1>
              </div>
              <div className="user-pill">
                <span className="pill-dot"></span>
                {totalUsers} active users
              </div>
            </div>
            <p className="welcome-copy">Track your tasks and stay productive.</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Productivity</div>
                <div className="stat-value">{stats.productivity}%</div>
                <div className="stat-progress">
                  <div className="progress-bar" style={{ width: `${stats.productivity}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Task Form */}
          <div className="todo-form-card">
            <form onSubmit={saveTodo} className="todo-form">
              <div className="form-row">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={editingTodoId ? "Edit task..." : "Add a new task..."}
                  className="todo-input"
                  disabled={isLoading}
                />
                <div className="color-picker">
                  {COLOR_TAGS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`color-option ${selectedColor === color.value ? "active" : ""}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {editingTodoId ? "Update" : "Add Task"}
                </button>
                {editingTodoId && (
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {message && <div className="info-banner">{message}</div>}
          </div>

          {/* Task List */}
          <div className="todo-list-container">
            <div className="list-header">
              <div>
                <h2>Recent Tasks</h2>
                <p>Your active and completed tasks</p>
              </div>
              <div className="list-filters">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "completed", label: "Completed" },
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`filter-btn ${filter === item.key ? "active" : ""}`}
                    onClick={() => setFilter(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading && todos.length === 0 ? (
              <div className="empty-state">
                <p>Loading tasks...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>{filter === "all" ? "No tasks yet. Add one to get started." : "No tasks match this filter."}</p>
              </div>
            ) : (
              <div className="todo-items">
                {filteredTodos.map((todo) => {
                  const colorStyle = getColorStyle(todo.color);
                  return (
                    <div key={todo._id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                      <label className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo._id)}
                        />
                        <span className="checkbox-custom"></span>
                      </label>
                      <div className="todo-main">
                        <span className="todo-title">{todo.name}</span>
                        <span className="todo-badge" style={{ backgroundColor: colorStyle.bg, color: colorStyle.value }}>
                          {colorStyle.label}
                        </span>
                      </div>
                      <div className="todo-actions">
                        <button className="action-btn edit-btn" onClick={() => startEdit(todo)}>
                          Edit
                        </button>
                        <button className="action-btn delete-btn" onClick={() => deleteTodo(todo._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;