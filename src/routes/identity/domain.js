import express from 'express';
import asyncHandler from 'express-async-handler';
import listDomains from 'controllers/identity/domain/list-domains';

const router = express.Router();
router.post('/list-domains', asyncHandler(async (req, res, next) => res.json(await listDomains(req.body))));

export default router;
