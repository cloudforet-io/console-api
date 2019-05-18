import express from 'express';
import userRouter from './userRouter';

var router = express.Router();

router.use('/user/', userRouter)

export default router