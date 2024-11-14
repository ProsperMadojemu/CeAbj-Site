import express from "express"
import { loginUser,registerUser,updateUser,getalldata,logoutUser, searchForUser, usersApi} from "../controllers/userController.js"

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/updateuser", updateUser);
userRouter.get("/getalldata", getalldata);
userRouter.get("/search", searchForUser);
userRouter.get("/api/users/search", usersApi);
userRouter.post("/logout", logoutUser);


export default userRouter;