// yaha par hum user ke sare routes rakhenge
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router=Router()

// jabh jo url match ho jayegi uska controller invoke ho jayega.
router.route("/register").post(registerUser)
// router.route("/login",login)

export default router