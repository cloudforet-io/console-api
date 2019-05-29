import express from 'express';
import authMiddleWare from '@/auth/authMiddleWare';
import userRouter from './User/userRoutes';
import authRouter from './Auth/authRoutes';

const Router = express.Router();

Router.use('/auth', authRouter);
Router.use('/users', authMiddleWare.middleAutuProcessor);
Router.use('/users', userRouter);

export default Router;
