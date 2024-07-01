const adminController = require("../controllers/adminController");
const express = require("express");

const router = express.Router();

router.route("/users").get(adminController.getAllUsers);

router.route("/tasks").get(adminController.getAllTasks);

module.exports = router;
