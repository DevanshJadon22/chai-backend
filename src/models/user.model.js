import mongoose ,{Schema} from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            // if you want any field to be optimised for searching in databases like mongodb then we use index:true for that field
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String, //cloudinary url
            required:true,
        },
        coverImage:{
            type: String, //cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            }
        ],
        password:{
            type:String,
            required:[true,"Passwaord is required"]
        },
        refreshToken:{
            type:String,
        }
    },{timestamps:true})

// using inbuilt hooks of mongoose for encryption of password before saving it
// the below written code is for mongoose version 8
// userSchema.pre("save",async function(next){
//     // the below written code will change the password every single time the user changes anything in the data base like his photo , avatar etc also so we have to write a logic that modify password only when the password feild is ChannelMergerNode.
//     // the logic for checking wether the password is modified is as follow
//     if(!this.isModified("password")) return next();
//     // the above if line checks wether the password is modified or not if not hen the function returns next() immediately
//     this.password=await bcrypt.hash(this.password,10);
//     next();
// })


//for mongoose version 9 onwards we will have to use below code.

userSchema.pre("save", async function () {
    // Case 1: User is logging in (only refreshToken changed, NOT password)
    // Hits 'return;', exits the function cleanly, Promise resolves -> Mongoose saves user!
    if (!this.isModified("password")) return;

    // Case 2: User is registering OR changing their password
    // Awaits bcrypt hashing, reaches end of function, Promise resolves -> Mongoose saves hashed password!
    this.password = await bcrypt.hash(this.password, 10);
});

//creating a custom method for comparing the password that user provides with the encrypted stored password in db
// using the .methods.ispasswordCorrect() mnetod 
userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)