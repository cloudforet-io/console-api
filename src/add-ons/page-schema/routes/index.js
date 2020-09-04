import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPageSchema } from '@/add-ons/page-schema/controllers';

const router = express.Router();
router.post('/get', asyncHandler(async (req, res, next) => {
    res.json(await getPageSchema(req.body));
}));

module.exports = router;
