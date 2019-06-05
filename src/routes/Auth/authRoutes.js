import express from 'express';
import { authService } from '@/service/';
import authMiddleWare from '@/auth/authMiddleWare';

// import authMiddleProcess from '@/controllers/';
const authRouter = express.Router();

// Check Logins with Session
authRouter.get('/', authService.sessionCheck);
authRouter.post('/login', authService.sessionLogin);
authRouter.post('/logout', authService.sessionLogout);

// Login
//authRouter.post('/register', authService.registerUser);
//authRouter.post('/login', authService.login);
//authRouter.get('/verifyLogin', authMiddleWare.middleAutuProcessor);
//authRouter.get('/verifyLogin', authService.verifyLogin);

// this must] be declared at end of the file.
export default authRouter;
