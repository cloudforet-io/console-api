import express from 'express';
import asyncHandler from 'express-async-handler';
import createDomain from 'controllers/identity/domain/create-domain';
import listDomains from 'controllers/identity/domain/list-domains';

const router = express.Router();
router.post('/create-domain', asyncHandler(async (req, res, next) => res.json(await createDomain(req.body))));
router.post('/list-domains', asyncHandler(async (req, res, next) => res.json(await listDomains(req.body))));

export default router;
