// require ('dotenv').config({path:'./env'})

import dotenv from 'dotenv'

// import mongoose from 'mongoose'
// import {DB_NAME} from './constants.js'
import connectDB from './db/index.js'

dotenv.config({path:'./env'})

connectDB()

// database sai jabh bhi baat karte h toh problems aa sakti h 
// problems aa sakti h isliye connection ki try catch mai wrap karna chaiye
// database humesha hi dusrai continent mai hota h 
// database sai baat karne mai time lagta h isliye app ko async await ka use karna chaiye

// method/Approach  1 to connect to the database
// using effy for connecting to the databse

/*import express from 'express'

const app=express();

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Err: ",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is Listening on port: ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw err
    }
})()
    */