const taskController = require("../controllers/taskController");
const authController = require("../controllers/authController");
const express = require("express");

const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

module.exports = router;
