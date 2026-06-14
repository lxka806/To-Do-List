import { useEffect, useState } from "react";

const VITE_URL = import.meta.env.VITE_URL

function Home() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState("blue");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [editingTodoId, setEditingTodoId] = useState(null);

    const token = localStorage.getItem("token");

    const getHeaders = (isJson = false) => {
        const headers = {};
        if (isJson) headers["Content-Type"] = "application/json";
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    };

    const fetchTodos = async () => {
        if (!token) {
            setMessage("Please log in to view your todos.");
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

        setTodos(data);
            } catch (error) {
        setMessage(error.message);
            } finally {
        setIsLoading(false);
        }
    };

    const saveTodo = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setMessage("Please enter a todo title.");
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
            if (!response.ok) throw new Error(data.message || "Failed to save todo.");

            setTitle("");
            setSelectedColor("blue");
            setEditingTodoId(null);
            setMessage(editingTodoId ? "Todo updated successfully." : "Todo created successfully.");
            await fetchTodos();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (todo) => {
        setEditingTodoId(todo._id);
        setTitle(todo.name || "");
        setSelectedColor(todo.color || "blue");
        setMessage("");
    };

    const cancelEdit = () => {
        setEditingTodoId(null);
        setTitle("");
        setSelectedColor("blue");
        setMessage("");
    };

    const deleteTodo = async (id) => {
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${VITE_URL}/api/list/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete todo.");
            }

            await fetchTodos();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTodo = async (id) => {
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${VITE_URL}/api/list/${id}/toggle`, {
                method: "PATCH",
                headers: getHeaders(),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to update todo.");
            }

            await fetchTodos();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <main className="home-page">
        <section className="todo-header">
            <h1>Todo List</h1>
            {message && <p className="message">{message}</p>}
        </section>

        <form className="todo-form" onSubmit={saveTodo}>
            <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a new todo"
            aria-label="Todo title"
            />

            <select
            value={selectedColor}
            onChange={(event) => setSelectedColor(event.target.value)}
            aria-label="Todo color"
            >
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="yellow">Yellow</option>
            </select>

            <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : editingTodoId ? "Update Todo" : "Add Todo"}
            </button>
            {editingTodoId && (
                <button type="button" onClick={cancelEdit} disabled={isLoading}>
                Cancel
                </button>
            )}
        </form>

        <section className="todo-list">
            {isLoading && todos.length === 0 ? (
            <p>Loading todos...</p>
            ) : todos.length === 0 ? (
            <p>No todos yet. Create your first todo.</p>
            ) : (
            todos.map((todo) => (
                <div key={todo._id} className="todo-item">
                <label>
                    <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id)}
                    />
                    <span>{todo.name}</span>
                </label>
                <div className="todo-actions">
                    <span className="todo-color">{todo.color}</span>
                    <button type="button" onClick={() => startEdit(todo)}>
                    Edit
                    </button>
                    <button type="button" onClick={() => deleteTodo(todo._id)}>
                    Delete
                    </button>
                </div>
                </div>
            ))
            )}
        </section>
        </main>
    );
}

export default Home;