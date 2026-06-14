const express = require("express")
const todoRoute = express.Router()

const protect = require("../middleware/auth.middleware")

const { 
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
} = require('../controllers/todo.controller')

todoRoute.get("/", protect, getTodos);
todoRoute.post("/", protect, createTodo);
todoRoute.patch("/:id", protect, updateTodo);
todoRoute.delete("/:id", protect, deleteTodo);
todoRoute.patch("/:id/toggle", protect, toggleTodo);

module.exports = todoRoute