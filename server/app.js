const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRoutes.js')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')

const User = require('./models/userModel.js')

const app = express(); 

app.use(morgan('dev'))

//PARSERS
app.use(bodyParser.json())
app.use(cookieParser())


//CORS WITH CREDENTIALS - FOR HTTP ONLY COOKIES
app.use(cors({
    origin:'http://localhost:1234',
    credentials:true
}))


//SET UP PUG AS THE VIEW ENGINE 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'pug')




//SERVE STATIC ASSETS BASED ON ENVIRONMENT 
if(process.env.NODE_ENV === 'development')
{
    app.use(express.static(path.join(__dirname, '../client/public')))
}
else 
{
    app.use(express.static(path.join(__dirname, '../client/dist')))
}


//VIEWS - (PUT) SETUP 
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')


//EXAMPLE ROUTE FOR RENDERING index.pug (SSR RENDERING - INITILALLY ONLY )
app.get('/api/v1', async (req,res) => {
   
   
   try 
   {
     let token  = '1111'

    if(!token) 
    {
        //USER NOT LOGGED IN , RENDER LOGIN /REGISTER VIEW
        res.render('index', {title: 'Login or Register'})
    }
    else 
    {
        //USER LOGGED IN , VERIFY JWT token 
        //.....

        console.log('TOKEN EXISTS -', token)


        //EXISTED HARDCODE UID 6679a0b1f475605265ae0be8
        const user = await User.findById('6679a0b1f475605265ae0be8')
        
        console.log('USER FOUND IN DB - RENDER HIS INFO(username and title welcome!')

        console.log(user)

        res.render('index', {
            title:'Welcome', 
            name: user.name, 
            tasks:[
                {title:'Gym', completed: true }, 
                {title:'Study', completed: false }
            ]
            })
        
    }


   } 
   catch(err)
   {
    console.log(err.message)
   }
   //CHECK JWT cookie for the authentication 
   
})

//IMPORTANT - PRODUCTION: 
//SERVE STATIC ASSETS FROM THE CLIENT PROJECT UNDER THE ..client/dist!!!!
// if(process.env.NODE_ENV === 'production') 
// {

//     app.use(express.static(path.join(__dirname, '../client/dist')))
    
//     app.get('*', (req,res) => {
//         console.log('PRODUCTION-----------------')
//         res.sendFile(path.resolve(__dirname, '../client/dist/index.html'))
//     })

// }


// //SERV



// //SSR
// //SERVER SIDE RENDERING WITH PUG  - INITIAL CONTENT DELIVARY ONLY !
// app.get('/api/v1', (req,res) => {
//     //CHECK JWT AUTHENTICATION ETC.. 
//     //let token = req.cookies['jwt']
//    let token = '1111'
//    console.log(token)
    

//     if(!token) 
//         res.render('index', {title: 'Login or Register'})

//     //ASSUME USER FOUND 
//     else 
//     {

//     //FAKE LOGGED IN USER AND TITLES
//     const user = {name: 'Nir'}

//     const tasks = [{
//         title: 'GYM', 
//         completed: false
//     }]

//     res.render('index', {
//         title: 'Welcome', 
//         name: user.name, 
//         tasks: tasks
//     })

    

//     }


// } )












module.exports = app;



/////////////////////////////////////////////
// const userRouter = require('./routes/userRoutes')
// const taskRouter = require('./routes/taskRoutes')

// const express = require('express');
// const multer = require('multer');
// const bodyParser = require('body-parser');
// const path = require('path');

// const cookieParser = require('cookie-parser')

// const bcrypt = require('bcryptjs');
// const cors = require('cors');

// const app = express();
// const port = 3000;

// //NOTE! WHEN I SPECIFIY IN THE CLIENT REQUEST THE ATTRIBUTE: 
// //credentials:'include' - THEN WHEN CONFIGURING CORS ON THE SERVER I MUST SPECIFY THE credentials:true
// app.use(cors({
//     origin:'http://localhost:1234',
//     credentials:true
// }))

// //CHECK IF MANDATORY -FOR MULTER!!!URL ENCODED!
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser());
// //app.use(bodyParser.urlencoded({ extended: true }));

// //STATIC FILES for serving user photos
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// // app.use('/uploads', express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// //END POINTS
// app.use('/api/v1/users', userRouter)
// app.use('/api/v1/tasks', taskRouter )

// module.exports = app;
