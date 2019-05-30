import express from 'express';
import { authService } from '@/service/';
import authMiddleWare from '@/auth/authMiddleWare';

// import authMiddleProcess from '@/controllers/';
const authRouter = express.Router();

// Login
authRouter.post('/register', authService.registerUser);
authRouter.post('/login', authService.login);
authRouter.get('/verifyLogin', authMiddleWare.middleAutuProcessor);
authRouter.get('/verifyLogin', authService.verifyLogin);
// this must] be declared at end of the file.
export default authRouter;
