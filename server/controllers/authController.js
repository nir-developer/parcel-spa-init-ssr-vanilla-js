const User = require("../models/userModel");

const jwt = require("jsonwebtoken");

//FOR PROMISIYING THE jwt.verify function
const { promisify } = require("util");
const crypto = require("crypto");

const path = require("path");
//MULTER SETUP
const multer = require("multer");

//1) CREATE A MULTER STORAGE (LATER I WILL CREATE A MEMOFY(BUFFER) SO THE UPLOADED IMAGE WILL BE USED BY OTHER PROCESSES)
const multerStorage = multer.diskStorage({
  //destination property :  cb is like the next in express(can be used to pass errors)
  destination: (req, file, cb) => {
    //First arg - is an error - if there is none - pass null
    cb(null, "public/img/users");
  },
  //filename property
  filename: (req, file, cb) => {
    //JONAS
    //TEST - OUTPUT  THE MIMETYPE (example:  application/json- TO GET THE FILE EXTENTION FOR THE FILENAME
    // const ext = file.mimetype.split('/')[1];

    //CHAT GPT -CREATE A NAME FOR THE USER PHOTO BASED ON I THE USER LOGGED IN OR NOT
    const ext = path.extname(file.originalname);
    console.log(ext);
    cb(null, `user-${req.user ? req.user.id : Date.now()}${ext}`);
  },
});

//2) CREATE A MULTER FILTER
//(The goal of my cb is to test if the file is an image
// - if so then pass true and vise versa )
//IF I WANT THEU USER TO UPLOAD CSV FILES etc... - THEN I CAN TEST FOT THIS
const multerFilter = (req, file, cb) => {
  //TEST THE MIME TYPE(NOTE - FOR ANY TYPE OF IMAGE(img, jpg, ,png, bitmap, tif -THE MIME TYPE WILL ALWAYS START WITH 'image'))
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //LATER HANDLE THIS ERROR BY RETURNING A JSON ERROR RESOPNSE! SINCE NOW IT'S HTML!!
    cb(new Error("Not an image! Please upload only image."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

//MULTER SETUP BEFORE CONFIGURING THE MULTER STORAGE AND MULTER FILTER - SIMPLE
// const upload = multer({dest: 'public/img/users'})
// exports.uploadUserPhoto = upload.single({dest:'public/img/users'})

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  console.log(
    "INSIDE CREATE SEND TOKEN: THE JWT IN THE HTTP ADDED TO THE RES OBJECT: ",
  );
  console.log(res.cookies);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    message: "HTTPOnly Cookie Set",
    data: {
      user,
    },
  });
};

/*
  IMPORTANT: 
      I SET MULTER TO UPLOAD IMAGES FILES UNDER: 'public/img/users' 
      => SET THE user photo property to the location: img/users/${req.file.filename} 
        or to img/users/default.jpg 

      THE IMPORTANT PART: The public is not in the path as the multer configuration which contains the public as the root folder! 

  destination:(req,file, cb) => {
    //First arg - is an error - if there is none - pass null
    cb(null, 'public/img/users')

  }, 
*/
exports.signup = async (req, res) => {
  try {
    // let photo = req.file?.filename;
    // console.log(photo)
    console.log("SIGNUP HANDLER - PHOTO:");
    console.log(req.file?.filename);

    //CREATE USER DOCUMENT
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // photo:req.file.filename
      //CHAT GPT ! WITH THE MULTER FOLDER : public/img/users/
      //DONT SPECIFY THE public folder in the URL!!
      photo: req.file
        ? `img/users/${req.file.filename}`
        : `img/users/default.jpg`,
    });

    //SAVE THE USER IN DB
    user = await user.save();

    console.log("SAVED USER SUCCESS ");
    console.log(user);

    console.log(user);

    createSendToken(user, 201, res);
  } catch (error) {
    console.log("signup handler error!", error.message);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password)
      return res
        .status(400)
        .json({ status: "fail", message: "email and password are required" });

    //GET THE USER FROM DATABASE BASED ON THE EMAIL
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    //COMPARE THE PASSWORDS
    // user.correctPassword(password, user.password)
    if (!user || !(await user.correctPassword(password, user.password)))
      return res.status(401).json({
        status: "fail",
        message: "email or password is incorrect",
      });
    //return next(new AppError('Incorrect email or password', 401))

    //AUTHENTICATED!!
    createSendToken(user, 200, res);
  } catch (error) {
    console.log("Failed to Signup");
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

//PROTECT M.W
exports.protect = async (req, res, next) => {
  console.log("INSIDE PROTECT - THE COOKIE SENT :");
  console.log(req.cookies.jwt);
  try {
    console.log("JWT IN THE COOKIES FOUND:");
    const token = req.cookies.jwt;
    console.log("token in the cookie:");
    console.log(token);

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN: ");
    console.log(decoded);

    const currentUser = await User.findById(decoded.id);

    console.log("currentUser with the decoded id: ");
    console.log(currentUser);

    req.user = currentUser;

    next();
    // return res.status(200).json("OK");

    // if (!token)
    //   return res.status(401).json({
    //     status: "fail",
    //     message: "You are not logged in! Please log in to get access.",
    //   });

    // // console.log('PROTECT - TOKEN BELONG TO THE USER!')

    // //2)jwt.verify Verify the token(THIS VERIFICATION STEP - MAKES SURE NO TEMPER AND NO EXPIRATION
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // console.log("PROTECT - DECODED TOKEN:");
    // console.log(decoded);

    // //STEP 3:  Check if user still exists
    // // const currentUser = await User.findById(decoded.id)
    // const currentUser = await User.findById(decoded.id);

    // console.log("PROTECT - CURRENT USER WITH DECODED ID");
    // console.log(currentUser);
    // console.log("PROTECT - USER IN DB FOUND: ");
    // console.log(currentUser);

    // if (!currentUser)
    //   return res.status(401).json({
    //     status: "fail",
    //     message: "The user belonging to this token does no longer exist.",
    //   });

    // //LATER!!
    // //STEP 4: CHECK IF USER HAS RECENTLY CHANGED HIS PASSWORD(AFTER THE JWT WAS ISSUED)
    // //LATER!!!
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   //  return next(new AppError('User recently changed password! Please log in again', 401))
    //   return res
    //     .status(400)
    //     .json({ status: "fail", message: "User recently chnaged password" });
    // }
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// exports.protect = async (req, res, next) => {
//   try {
//     let token;

//     //STEP 1:  Getting token from request.headers object and check if it's there(Express make it lower case!)
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }
//     //CHECK FOR THE JWT COOKIE - FOR WEBSITE RENDERING
//     else if (req.cookies.jwt) {
//       //GREAT!!!
//       // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
//       // console.log('THERE IS A JWT COOKIE!!!!!!')
//       token = req.cookies.jwt;
//     }

//     console.log("PROTECT - THE TOKEN:");
//     console.log(token);

//     if (!token)
//       return next(
//         new AppError(
//           "You are not logged in! Please log in to get access.",
//           401,
//         ),
//       );

//     //2)jwt.verify Verify the token(THIS VERIFICATION STEP - MAKES SURE NO TEMPER AND NO EXPIRATION
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     //STEP 3:  Check if user still exists
//     const currentUser = await User.findById(decoded.id);

//     if (!currentUser)
//       return next(
//         new AppError(
//           "The user belonging to this token does no longer exist.",
//           401,
//         ),
//       );

//     //STEP 4: CHECK IF USER HAS RECENTLY CHANGED HIS PASSWORD(AFTER THE JWT WAS ISSUED)
//     if (currentUser.changedPasswordAfter(decoded.iat)) {
//       return next(
//         new AppError(
//           "User recently changed password! Please log in again",
//           401,
//         ),
//       );
//     }

//     req.user = currentUser;

//     next();
//   } catch (error) {}
// };

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.json({ status: "success", message: "Logged out successfully" });
    console.log("OK");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
exports.checkLoggedIn = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user)
      return res.status(400).json({
        status: "fail",
        message: "User not found",
      });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });

    // const user = await User.findById(req.user.id).select('-password')
    // console.log('checkLoggedIn Handler:found user by id of req.user.id:')
    // console.log(user);

    // if(!user) return
    // console.log('INSIDE CHECK LOGGED IN')
    // console.log('checkLoggedIn Handler')
    // const user = await User.findById(req.user.id)
    // console.log('checkLoggedIn USER WITH req.use.id FOUND IN DB!')

    // //PERFECT - IF THERE IS A LOGGED IN USER - IT HAS BEEN PASSED TO THIS HANDLER BY THE PROTECT M.W
    // // console.log('req.user:')
    // // console.log(req.user)

    // //RETURN THE CURRENT LOGGED IN USER

    // // res.status(200).json({
    // //   status:'success',
    // //   data: {
    // //     user: req.user
    // //   }
    // // })
  } catch (error) {
    console.log("checkedLoggedIn handler - error", error.message);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

//GET USER INFORMATION
exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

//JONAS
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) VERIFY THE TOKEN:  MAKES SURE NO TEMPER AND NO EXPIRATION
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //STEP 2:  Check if user still exists  - AND DONT THROW ERROR
      //INSTEAD MOVE ON TO THE NEXT M.W(RETURN NEXT() - WITHOUT PASSING THE ERROR PARAMETER!!)
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      //STEP 3: CHECK IF USER HAS RECENTLY CHANGED HIS PASSWORD(AFTER THE JWT WAS ISSUED)
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGGED IN USER
      //-> MAKE IT ACCESSIBLE TO ALL TEMPLATES -  USING RESPONSE LOCALS OF EXPRESS
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      //JUST GO TO NEXT M.W !
      return next();
    }
  }
};

//CHAT GPT M.W SIMILAR TO PROTECT M.W
exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res
        .status(401)
        .json({ status: "fail", message: "Authorization denied" });

    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    //SET USER IN REQUEST
    const userId = decoded.id;
    console.log("decoded.id:" + userId);

    // 6677e817fa3d904741b4023a
    const user = await User.findById(userId);
    console.log("user:");
    console.log(user);

    //CHECK IF USER EXISTS
    // const user = await User.findById(req.user.id).select('-password')
    if (!user)
      return res
        .status(401)
        .json({ status: "fail", message: "User not authorized" });

    //PROCEED TO NEXT M.W
    next();
  } catch (error) {
    console.log("auth M.W: Error :", error.message);
    res.status(401).json({ status: "fail", message: "Token is not valid" });
  }
};
