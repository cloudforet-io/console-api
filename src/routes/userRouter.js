import express from 'express';
import { userService } from '@/service';

const userRouter = express.Router();

userRouter.get('/list', userService.list);

export default userRouter;
