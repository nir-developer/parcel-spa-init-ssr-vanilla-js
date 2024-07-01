const Task = require("../models/taskModel");

exports.createTask = async (req, res) => {
  try {
    //CHECK THE USER IN THE REQUEST FROM THE NEXT OF PROTECT:
    console.log(
      "INSIDE createTask handler - the user passed from thep protect m.w is: ",
    );

    console.log(req.user);

    //GET THE TASKS OF THE USER FROM THE DB
    const tasks = await Task.find({ user: req.user._id });
    console.log(
      "INSIDE createTask handler - the tasks of the logged in user are: ",
    );

    console.log(tasks);

    return res.json("OK");
    // let { title, description, user } = req.body;
    // const { title, description } = req.body;
    // const userId = req.user._id;

    // if (!title || !description || !user)
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "Pleas provide all required fields",
    //   });

    // const task = await Task.create({ title, description, user });

    // console.log("new task created!");

    // res.status(201).json({
    //   status: "success",
    //   data: {
    //     task,
    //   },
    // });
  } catch (err) {
    console.log("FAILED TO CREATE TASK");
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();

    console.log(tasks);

    res.status(200).json({
      status: "success",
      results: tasks.length,
      body: {
        tasks,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
