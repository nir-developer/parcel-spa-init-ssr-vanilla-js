const User = require("../models/userModel");
const Task = require("../models/taskModel");

//TASKS RESOURCES
//USERS RESOURCES
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log(tasks);

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (err) {
    console.log("COULD NOT GET TASKS FROM DB", err.message);
    res.status(500).json({
      messege: err.message,
      status: "fail",
    });
  }
};

//USERS RESOURCES
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    console.log("COULD NOT GET USERS FROM DB", err.message);
    res.status(500).json({
      messege: err.message,
      status: "fail",
    });
  }
};
