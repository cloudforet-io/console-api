import express from 'express';
import { authService } from '@/service/';
import authMiddleWare from '@/auth/authMiddleWare';

// import authMiddleProcess from '@/controllers/';
const authRouter = express.Router();

// Check Login Status
authRouter.get('/', authService.sesionCheck);
authRouter.post('/ab', authService.updateLoginStatus);
authRouter.get('/', authService.sesionCheck);
authRouter.post('/sessionLogIn', authService.sessionLogin);
authRouter.get('/sessionLogOut', authService.sessionLogout);
// Login
authRouter.post('/register', authService.registerUser);
authRouter.post('/login', authService.login);
authRouter.get('/verifyLogin', authMiddleWare.middleAutuProcessor);
authRouter.get('/verifyLogin', authService.verifyLogin);

//authRouter.get('/Logout', authService.logout);
// this must] be declared at end of the file.
export default authRouter;
