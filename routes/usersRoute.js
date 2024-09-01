import express from "express"
import { loginUser,registerUser,updateUser,getalldata,logoutUser, searchForUser} from "../controllers/userController.js"

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/updateuser", updateUser);
userRouter.get("/getalldata", getalldata);
userRouter.get("/search", searchForUser);
userRouter.post("/logout", logoutUser);


export default userRouter;