const List = require("../models/todo.model");

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await List.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: {
                            $cond: ["$completed", 1, 0],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "auths",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: "$user._id",
                    fullname: "$user.fullname",
                    email: "$user.email",
                    totalTasks: 1,
                    completedTasks: 1,
                },
            },
            { $sort: { completedTasks: -1, totalTasks: -1 } },
        ]);

        return res.status(200).json(leaderboard);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLeaderboard,
};
