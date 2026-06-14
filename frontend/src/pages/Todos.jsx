import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Todos.css";

const VITE_URL = import.meta.env.VITE_URL;

const COLOR_TAGS = [
    { value: "#3b82f6", label: "Blue", bg: "#eff6ff" },
    { value: "#10b981", label: "Green", bg: "#ecfdf5" },
    { value: "#ef4444", label: "Red", bg: "#fef2f2" },
    { value: "#f59e0b", label: "Amber", bg: "#fffbeb" },
    { value: "#8b5cf6", label: "Purple", bg: "#f5f3ff" },
    { value: "#06b6d4", label: "Cyan", bg: "#ecfeff" },
];

function Todos() {
    const [todos, setTodos] = useState([]);
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [title, setTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState("#3b82f6");
    const [filter, setFilter] = useState("all");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [dragStartId, setDragStartId] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const getHeaders = (isJson = false) => {
        const headers = {};
        if (isJson) headers["Content-Type"] = "application/json";
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    };

    const fetchTodos = async () => {
        if (!token) {
            setTodos([]);
            return;
        }

        setIsLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const response = await fetch(`${VITE_URL}/api/list`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load tasks.");

            setTodos(data || []);
        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    const getColorStyle = (colorValue) => {
        return COLOR_TAGS.find((item) => item.value === colorValue) || COLOR_TAGS[0];
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleEdit = (todo) => {
        setEditingTodoId(todo._id);
        setTitle(todo.name || "");
        setSelectedColor(todo.color || "#3b82f6");
        setMessage("");
        setMessageType("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!title.trim()) {
            setMessage("Please enter a task name.");
            setMessageType("error");
            setTimeout(() => setMessage(""), 2500);
            return;
        }

        if (!token) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const url = editingTodoId ? `${VITE_URL}/api/list/${editingTodoId}` : `${VITE_URL}/api/list`;
            const method = editingTodoId ? "PATCH" : "POST";
            const response = await fetch(url, {
                method,
                headers: getHeaders(true),
                body: JSON.stringify({ name: title, color: selectedColor }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to save task.");

            setTitle("");
            setSelectedColor("#3b82f6");
            setEditingTodoId(null);
            setMessage(editingTodoId ? "Task updated successfully!" : "Task added successfully!");
            setMessageType("success");
            setTimeout(() => setMessage(""), 2000);
            await fetchTodos();
        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        setIsLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const response = await fetch(`${VITE_URL}/api/list/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete task.");
            }
            setMessage("Task removed.");
            setMessageType("success");
            setTimeout(() => setMessage(""), 2000);
            await fetchTodos();
        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id) => {
        if (!token) return;
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
            setMessageType("error");
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (id) => {
        setDragStartId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (dropId) => {
        if (!dragStartId || dragStartId === dropId) return;
        
        const dragIndex = todos.findIndex(t => t._id === dragStartId);
        const dropIndex = todos.findIndex(t => t._id === dropId);
        
        const reordered = [...todos];
        const [draggedItem] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, draggedItem);
        
        setTodos(reordered);
        setDragStartId(null);
    };

    const cancelEdit = () => {
        setEditingTodoId(null);
        setTitle("");
        setSelectedColor("#3b82f6");
        setMessage("");
        setMessageType("");
    };

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        pending: todos.filter(t => !t.completed).length,
        productivity: todos.length ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
    };

    if (!token) {
        return (
            <div className="todos-container">
                <div className="locked-dashboard">
                    <div className="dashboard-preview">
                        <div className="preview-header"></div>
                        <div className="preview-stats">
                            <div className="preview-card"></div>
                            <div className="preview-card"></div>
                            <div className="preview-card"></div>
                        </div>
                        <div className="preview-task-list">
                            <div className="preview-task"></div>
                            <div className="preview-task"></div>
                        </div>
                    </div>
                    <div className="lock-card">
                        <div className="lock-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C8.13 2 5 5.13 5 9v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V9c0-3.87-3.13-7-7-7z" stroke="#3b82f6" strokeWidth="2"/>
                                <rect x="8" y="11" width="8" height="11" rx="2" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"/>
                                <circle cx="12" cy="16" r="1.5" fill="#3b82f6"/>
                                <line x1="12" y1="12" x2="12" y2="15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h2>Access Your Tasks</h2>
                        <p>Sign in to create, organize, and track your daily tasks.</p>
                        <div className="lock-actions">
                            <button onClick={() => navigate("/login")} className="btn-primary">Sign In</button>
                            <button onClick={() => navigate("/signup")} className="btn-secondary">Create Account</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="todos-container">
            <div className="todos-content">
                {/* Header Section */}
                <div className="page-header">
                    <div>
                        <h1>Tasks</h1>
                        <p>Manage and organize your daily workflow</p>
                    </div>
                    <div className="header-stats">
                        <div className="mini-stat">
                            <span className="mini-stat-value">{stats.total}</span>
                            <span className="mini-stat-label">Total</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat-value">{stats.completed}</span>
                            <span className="mini-stat-label">Done</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat-value">{stats.productivity}%</span>
                            <span className="mini-stat-label">Rate</span>
                        </div>
                    </div>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`message-toast ${messageType}`}>
                        <i className={`fas ${messageType === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                        {message}
                    </div>
                )}

                {/* Add Task Form */}
                <div className="task-form-card">
                    <form onSubmit={handleSubmit} className="task-form">
                        <div className="form-row">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={editingTodoId ? "Edit task..." : "Add a new task..."}
                                className="task-input"
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
                            <div className="form-buttons">
                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {editingTodoId ? "Update Task" : "Add Task"}
                                </button>
                                {editingTodoId && (
                                    <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {[
                        { key: "all", label: "All Tasks", icon: "📋" },
                        { key: "active", label: "Active", icon: "⏳" },
                        { key: "completed", label: "Completed", icon: "✅" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            className={`filter-tab ${filter === item.key ? "active" : ""}`}
                            onClick={() => setFilter(item.key)}
                        >
                            <span className="filter-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                <div className="task-list-container">
                    {isLoading && todos.length === 0 ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your tasks...</p>
                        </div>
                    ) : filteredTodos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No tasks here</h3>
                            <p>{filter === "all" ? "Create your first task using the form above." : `No ${filter} tasks found.`}</p>
                        </div>
                    ) : (
                        <div className="task-items">
                            {filteredTodos.map((todo) => {
                                const colorStyle = getColorStyle(todo.color);
                                return (
                                    <div
                                        key={todo._id}
                                        className={`task-item ${todo.completed ? "completed" : ""}`}
                                        draggable
                                        onDragStart={() => handleDragStart(todo._id)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(todo._id)}
                                    >
                                        <div className="task-check">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    checked={todo.completed}
                                                    onChange={() => handleToggle(todo._id)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <div className="task-details">
                                            <span className="task-title">{todo.name}</span>
                                            <span className="task-badge" style={{ backgroundColor: colorStyle.bg, color: colorStyle.value }}>
                                                {colorStyle.label}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(todo)}>
                                                Edit
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(todo._id)}>
                                                Delete
                                            </button>
                                        </div>
                                        <div className="drag-handle">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="12" r="1.5" />
                                                <circle cx="15" cy="12" r="1.5" />
                                                <circle cx="9" cy="18" r="1.5" />
                                                <circle cx="15" cy="18" r="1.5" />
                                                <circle cx="9" cy="6" r="1.5" />
                                                <circle cx="15" cy="6" r="1.5" />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Motivational Footer */}
                {todos.length > 0 && stats.productivity === 100 && (
                    <div className="motivation-footer">
                        <span>🎉</span>
                        <span>Perfect! You've completed all your tasks!</span>
                    </div>
                )}
                {todos.length > 0 && stats.productivity > 0 && stats.productivity < 100 && stats.productivity >= 50 && (
                    <div className="motivation-footer">
                        <span>💪</span>
                        <span>Great progress! Keep going!</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Todos;