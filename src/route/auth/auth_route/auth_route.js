import express from 'express';

import authService from '@/route/auth/auth_service/auth_service';
import authMiddleWare from '@/auth/auth_middle_ware';

const authRouter = express.Router();

// authRouter.get('/', authService.sessionCheck);
authRouter.post('/login', authService.sessionLogin);
authRouter.post('/logout', authService.sessionLogout);

// Login
// authRouter.post('/register', authService.registerUser);
// authRouter.post('/login', authService.login);
// authRouter.get('/verifyLogin', authMiddleWare.middleAutuProcessor);
// authRouter.get('/verifyLogin', authService.verifyLogin);

// this must] be declared at end of the file.
export default authRouter;
