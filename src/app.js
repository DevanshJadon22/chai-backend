import express from 'express'
import cors from'cors'
import cookieParser from 'cookie-parser'

const app= express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//adding middleware for setting up the allowed datatype like json,body and limits to avoid server crashin
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

export { app }