import express from 'express';
import { userService } from '@/service';

var userRouter = express.Router();

userRouter.get('/list', userService.list);

export default userRouter;