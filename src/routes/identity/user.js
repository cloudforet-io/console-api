import express from 'express';
import asyncHandler from 'express-async-handler';
import listUsers from 'controllers/identity/user/list-users';

const router = express.Router();
router.post('/list-users', asyncHandler(async (req, res, next) => res.json(await listUsers(req.body))));

export default router;
