import express from 'express'
import cors from'cors'
import cookieParser from 'cookie-parser'

const app= express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//adding middleware for setting up the allowed datatype like json,body and limits to avoid server crashing
app.use(express.json({
    limit:"16kb"
}))

// configuring the express to take data from url so adding middleware to handle this 
app.use(express.urlencoded({extended:true,limit:"16kb"}))

// we will again add another middleware for storing the pdf, documents/data that reaches server and string thenm on the  server in a folder named "public" so that anyone can acess them.
app.use(express.static("public"))

// we use cookieParser for acessing the cookie of user's browser from server and modify them from server only
// so to do so we need to configure the cookie parser middleware
app.use(cookieParser())

// routes importing 
import userRouter from './routes/user.routes.js'

// route declearation 
// jab hum same file mai hi routes aur controller likh rahe the toh hum app.get() /app.post() sai route define kar sakte the par
// production grade mai seperate files mai hi likha jata h routes aur controllers ko isliye hume middleware ka use karna padta h
app.use("/api/v1/users",userRouter); // is line ka matlab h jaise hi client url mai type kare /users toh flow of execution/ control sidha userRouter.js file mai chala jayega aur vaha pe jo route match hoga uske associated method/controller invoke ho jayega.
// hume jab bhi api define karni hoti h toh uska version bhi likhna padta h (optional h par standardised h )


// ex: http://localhost:8000/api/v1/users/register

export { app }