
const express = require('express')

const authController = require('../controllers/authController')


const path = require('path')


const router = express.Router(); 

router.post('/signup', authController.uploadUserPhoto, authController.signup)

router.post('/login', authController.login)


//WITH OR WITHOUT PROTECT???????????????????????
router.get('/checkLoggedIn',authController.protect,  authController.checkLoggedIn)

router.post('/logout', authController.protect ,authController.logout)

//USER INFO - WILL BE CALLED ON INIT CLIENT APP
router.get('/me', authController.getMe)

//MULTER AT THE BEGINNING!! MOVE THIS CODE TO THE AUTH CONTROLLER
// const multer = require('multer'); 

// //SPECIFY THE FOLDER TO STORE THE UPLOADED USER UPLOADS IMAGES
// //NOTE - WITHOUT SPECIFY THE DEST - MULTER WILL USE IN MEMORY !
// const upload = multer({dest: 'public/img/users'})

// router.post('/signup', upload.single('photo'), authController.signup )
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Append extension
//   }
// });


// const upload = multer({ storage: storage });

//////////////////////////////////////////






//the parameter passed to single is the 'name' attribute of the HTML(I used formData.append() - so it added this attribute!) 

// router.post('/login', login);


module.exports = router; 


