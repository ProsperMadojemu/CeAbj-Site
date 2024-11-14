import express from "express"
import { loginUser,registerUser,updateUser,getalldata,logoutUser, usersApi} from "../controllers/userController.js"

const userRouter = express.Router();

userRouter.post("/api/user/login", loginUser);
userRouter.post("/api/user/register", registerUser);
userRouter.put("/api/user/update", updateUser);
userRouter.get("/api/user/getalldata", getalldata);
userRouter.get("/api/users/search", usersApi);
userRouter.post("/api/user/logout", logoutUser);


export default userRouter;