import express from 'express';
import userRouter from './User/userRoutes';

const Router = express.Router();

Router.use('/users', userRouter);

export default Router;
