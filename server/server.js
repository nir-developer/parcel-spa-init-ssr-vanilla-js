const dotenv = require('dotenv')
dotenv.config({path:'config.env'})
const mongoose = require('mongoose')


const app = require("./app")

const PORT = process.env.PORT; 
const ENV = process.env.NODE_ENV; 
console.log(ENV)
let DB ;

if(ENV=== 'development')
    DB = process.env.DB_COMPASS
else if(ENV === 'production')
    DB = process.env.DB_ATLAS



mongoose.connect(DB) 
.then(()=> {
    console.log(`CONNECTING TO DB: ${DB}`)
    //app.listen(PORT, () => console.log(`Natours API listening on port  ${PORT} in ${process.env.NODE_ENV} mode`))
    app.listen(PORT, () => console.log('TEST SSR SPA PARCEL JS VANILLA', PORT))

})
