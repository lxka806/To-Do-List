const List = require("../models/todo.model");

const getTodos = async (req, res) => {
    try {
        const todos = await List.find({
            user: req.user.id,
        });

        return res.status(200).json(todos);

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};

const createTodo = async (req, res) => {
    try {
        const { name, color, type } = req.body;

        const newTodo = await List.create({
            name,
            color,
            type,
            completed: false,
            user: req.user.id,
        });

        return res.status(201).json(newTodo);

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};

const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedTodo = await List.findOneAndUpdate(
            {
                _id: id,
                user: req.user.id,
            },
            req.body,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        return res.status(200).json(updatedTodo);

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTodo = await List.findOneAndDelete({
            _id: id,
            user: req.user.id,
        });

        if (!deletedTodo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        return res.status(200).json({
            message: "Todo deleted successfully",
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};

const toggleTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await List.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        todo.completed = !todo.completed;

        await todo.save();

        return res.status(200).json(todo);

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
};