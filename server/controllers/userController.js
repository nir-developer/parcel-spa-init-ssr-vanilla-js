const User = require("../models/userModel");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);

    res.staus(200).json({
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
