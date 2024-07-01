const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: "String",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  //CHECK IF IT IS REQUIRED  - OR THE ARRAY OF TASK IDS IN THE USER ENOUGH
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
